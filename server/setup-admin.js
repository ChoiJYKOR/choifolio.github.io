const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

// Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  isAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', AdminSchema);

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공\n');

    // 기존 관리자 확인
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
      console.log('⚠️  이미 관리자 계정이 존재합니다.');
      console.log(`   현재 관리자: ${existingAdmin.username}`);
      console.log(`   생성일: ${existingAdmin.createdAt.toLocaleString('ko-KR')}\n`);
      
      const overwrite = await question('기존 계정을 삭제하고 새로 만드시겠습니까? (y/N): ');
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n설정을 취소했습니다.');
        rl.close();
        process.exit(0);
      }
      
      await Admin.deleteMany({});
      console.log('✅ 기존 관리자 계정 삭제 완료\n');
    }

    // 새 관리자 정보 입력
    console.log('=== 새 관리자 계정 생성 ===\n');
    
    const username = await question('아이디를 입력하세요: ');
    if (!username || username.trim().length < 3) {
      console.error('❌ 아이디는 최소 3자 이상이어야 합니다.');
      rl.close();
      process.exit(1);
    }

    const email = await question('이메일을 입력하세요 (선택사항): ');

    const password = await question('비밀번호를 입력하세요 (최소 8자): ');
    if (!password || password.length < 8) {
      console.error('❌ 비밀번호는 최소 8자 이상이어야 합니다.');
      rl.close();
      process.exit(1);
    }

    const passwordConfirm = await question('비밀번호를 다시 입력하세요: ');
    if (password !== passwordConfirm) {
      console.error('❌ 비밀번호가 일치하지 않습니다.');
      rl.close();
      process.exit(1);
    }

    // 비밀번호 해싱
    console.log('\n🔒 비밀번호 암호화 중...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 생성
    const admin = new Admin({
      username: username.trim(),
      email: email.trim() || undefined,
      password: hashedPassword,
      isAdmin: true
    });

    await admin.save();

    console.log('\n✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log('\n=== 로그인 정보 ===');
    console.log(`아이디: ${admin.username}`);
    console.log(`이메일: ${admin.email || '(없음)'}`);
    console.log('비밀번호: (입력하신 비밀번호)\n');
    console.log('⚠️  이 정보를 안전한 곳에 보관하세요!\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

// 스크립트 실행
console.log('\n========================================');
console.log('   포트폴리오 관리자 계정 설정');
console.log('========================================\n');

setupAdmin();

