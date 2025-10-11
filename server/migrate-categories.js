/**
 * 카테고리 마이그레이션 스크립트
 * 기존 category: String 필드를 categoryIds: [ObjectId] 배열로 변환
 */

const mongoose = require('mongoose');
const config = require('./config');
const models = require('./models');

const { Category, Book, Project, VideoLearning, VideoPlaylist } = models;

async function migrateCategories() {
  try {
    // MongoDB 연결
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB 연결 성공');

    // 1단계: 모든 고유 카테고리 문자열 수집
    console.log('\n📊 1단계: 고유 카테고리 수집 중...');
    
    const uniqueCategories = new Set();

    const [books, projects, videoLearnings, videoPlaylists] = await Promise.all([
      Book.find({ category: { $exists: true, $ne: null, $ne: '' } }).select('category'),
      Project.find({ category: { $exists: true, $ne: null, $ne: '' } }).select('category'),
      VideoLearning.find({ category: { $exists: true, $ne: null, $ne: '' } }).select('category'),
      VideoPlaylist.find({ category: { $exists: true, $ne: null, $ne: '' } }).select('category')
    ]);

    books.forEach(item => item.category && uniqueCategories.add(item.category));
    projects.forEach(item => item.category && uniqueCategories.add(item.category));
    videoLearnings.forEach(item => item.category && uniqueCategories.add(item.category));
    videoPlaylists.forEach(item => item.category && uniqueCategories.add(item.category));

    console.log(`   발견된 고유 카테고리: ${uniqueCategories.size}개`);
    console.log(`   카테고리 목록: ${Array.from(uniqueCategories).join(', ')}`);

    // 2단계: Category 컬렉션에 카테고리 생성
    console.log('\n📝 2단계: Category 컬렉션 생성 중...');
    
    const categoryMap = new Map(); // name -> ObjectId 매핑
    let order = 0;

    for (const categoryName of uniqueCategories) {
      try {
        let category = await Category.findOne({ name: categoryName });
        
        if (!category) {
          category = new Category({
            name: categoryName,
            order: order++
          });
          await category.save();
          console.log(`   ✅ 생성: ${categoryName} (${category._id})`);
        } else {
          console.log(`   ⏭️  이미 존재: ${categoryName} (${category._id})`);
        }
        
        categoryMap.set(categoryName, category._id);
      } catch (error) {
        console.error(`   ❌ 생성 실패: ${categoryName}`, error.message);
      }
    }

    // 3단계: 각 모델의 category를 categoryIds로 변환
    console.log('\n🔄 3단계: 데이터 마이그레이션 중...');

    // Book 마이그레이션
    console.log('\n   📚 Book 마이그레이션...');
    const booksToMigrate = await Book.find({ 
      category: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { categoryIds: { $exists: false } },
        { categoryIds: { $size: 0 } }
      ]
    });
    
    for (const book of booksToMigrate) {
      const categoryId = categoryMap.get(book.category);
      if (categoryId) {
        book.categoryIds = [categoryId];
        await book.save();
        console.log(`      ✅ ${book.title}: "${book.category}" → [${categoryId}]`);
      }
    }
    console.log(`   완료: ${booksToMigrate.length}개 서적 마이그레이션`);

    // Project 마이그레이션
    console.log('\n   🚀 Project 마이그레이션...');
    const projectsToMigrate = await Project.find({ 
      category: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { categoryIds: { $exists: false } },
        { categoryIds: { $size: 0 } }
      ]
    });
    
    for (const project of projectsToMigrate) {
      const categoryId = categoryMap.get(project.category);
      if (categoryId) {
        project.categoryIds = [categoryId];
        await project.save();
        console.log(`      ✅ ${project.title}: "${project.category}" → [${categoryId}]`);
      }
    }
    console.log(`   완료: ${projectsToMigrate.length}개 프로젝트 마이그레이션`);

    // VideoLearning 마이그레이션
    console.log('\n   📹 VideoLearning 마이그레이션...');
    const videoLearningsToMigrate = await VideoLearning.find({ 
      category: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { categoryIds: { $exists: false } },
        { categoryIds: { $size: 0 } }
      ]
    });
    
    for (const video of videoLearningsToMigrate) {
      const categoryId = categoryMap.get(video.category);
      if (categoryId) {
        video.categoryIds = [categoryId];
        await video.save();
        console.log(`      ✅ ${video.title}: "${video.category}" → [${categoryId}]`);
      }
    }
    console.log(`   완료: ${videoLearningsToMigrate.length}개 영상 마이그레이션`);

    // VideoPlaylist 마이그레이션
    console.log('\n   📺 VideoPlaylist 마이그레이션...');
    const videoPlaylistsToMigrate = await VideoPlaylist.find({ 
      category: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { categoryIds: { $exists: false } },
        { categoryIds: { $size: 0 } }
      ]
    });
    
    for (const playlist of videoPlaylistsToMigrate) {
      const categoryId = categoryMap.get(playlist.category);
      if (categoryId) {
        playlist.categoryIds = [categoryId];
        await playlist.save();
        console.log(`      ✅ ${playlist.title}: "${playlist.category}" → [${categoryId}]`);
      }
    }
    console.log(`   완료: ${videoPlaylistsToMigrate.length}개 재생 목록 마이그레이션`);

    // 최종 통계
    console.log('\n\n🎉 마이그레이션 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   생성된 카테고리: ${categoryMap.size}개`);
    console.log(`   마이그레이션된 서적: ${booksToMigrate.length}개`);
    console.log(`   마이그레이션된 프로젝트: ${projectsToMigrate.length}개`);
    console.log(`   마이그레이션된 영상: ${videoLearningsToMigrate.length}개`);
    console.log(`   마이그레이션된 재생 목록: ${videoPlaylistsToMigrate.length}개`);
    console.log(`   총 마이그레이션: ${booksToMigrate.length + projectsToMigrate.length + videoLearningsToMigrate.length + videoPlaylistsToMigrate.length}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 연결 종료');
    process.exit(0);
  }
}

// 스크립트 실행
console.log('🚀 카테고리 마이그레이션 시작...\n');
migrateCategories();
