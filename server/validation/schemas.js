/**
 * Joi 유효성 검사 스키마
 * 모든 API 입력값 검증 스키마를 중앙에서 관리
 */

const Joi = require('joi');

// =================================================================
// 공통 유틸리티
// =================================================================

// Joi 유효성 검사 미들웨어
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: '입력값 유효성 검사 실패',
        errors: errorMessages
      });
    }
    
    req[property] = value;
    next();
  };
};

// MongoDB ObjectId 검증 함수
const validateObjectId = (req, res, next) => {
  const { error } = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).validate(req.params.id);
  
  if (error) {
    return res.status(400).json({
      message: '올바른 ID 형식이 아닙니다',
      error: 'Invalid ObjectId format'
    });
  }
  
  next();
};

// =================================================================
// 인증 관련 스키마
// =================================================================

const adminLoginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '사용자명은 영문자와 숫자만 사용 가능합니다',
      'string.min': '사용자명은 최소 3자 이상이어야 합니다',
      'string.max': '사용자명은 최대 30자까지 가능합니다',
      'any.required': '사용자명은 필수 입력 항목입니다'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 6자 이상이어야 합니다',
      'string.max': '비밀번호는 최대 128자까지 가능합니다',
      'string.pattern.base': '비밀번호에 허용되지 않는 문자가 포함되어 있습니다',
      'any.required': '비밀번호는 필수 입력 항목입니다'
    })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': '현재 비밀번호는 최소 6자 이상이어야 합니다',
      'string.max': '현재 비밀번호는 최대 128자까지 가능합니다',
      'any.required': '현재 비밀번호는 필수 입력 항목입니다'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .required()
    .messages({
      'string.min': '새 비밀번호는 최소 6자 이상이어야 합니다',
      'string.max': '새 비밀번호는 최대 128자까지 가능합니다',
      'string.pattern.base': '새 비밀번호에 허용되지 않는 문자가 포함되어 있습니다',
      'any.required': '새 비밀번호는 필수 입력 항목입니다'
    })
});

// =================================================================
// 데이터 모델 스키마
// =================================================================

const bookSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  author: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .allow('')
    .messages({
      'string.min': '저자명은 1자 이상이어야 합니다',
      'string.max': '저자명은 100자를 초과할 수 없습니다'
    }),
  category: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.min': '카테고리는 1자 이상이어야 합니다',
      'string.max': '카테고리는 50자를 초과할 수 없습니다'
    }),
  categoryIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'array.base': '카테고리 ID는 배열이어야 합니다'
    }),
  coverImage: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 이미지 URL 형식이어야 합니다'
    }),
  readDate: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': '올바른 날짜 형식이어야 합니다 (YYYY-MM-DD)'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .allow(null)
    .messages({
      'number.base': '평점은 숫자여야 합니다',
      'number.integer': '평점은 정수여야 합니다',
      'number.min': '평점은 1점 이상이어야 합니다',
      'number.max': '평점은 5점을 초과할 수 없습니다'
    }),
  // 🌟 서적 전체와 관련된 스킬 ID 목록
  skillIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': '올바른 스킬 ID 형식이 아닙니다'
        })
    )
    .max(50)
    .default([])
    .messages({
      'array.max': '스킬은 최대 50개까지 연결 가능합니다'
    })
});

const experienceSchema = Joi.object({
  period: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': '기간은 1자 이상이어야 합니다',
      'string.max': '기간은 100자를 초과할 수 없습니다',
      'any.required': '기간은 필수 입력 항목입니다'
    }),
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  titleEn: Joi.string().max(200).trim().allow('').optional(),
  titleJa: Joi.string().max(200).trim().allow('').optional(),
  company: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': '회사명은 1자 이상이어야 합니다',
      'string.max': '회사명은 100자를 초과할 수 없습니다',
      'any.required': '회사명은 필수 입력 항목입니다'
    }),
  companyEn: Joi.string().max(100).trim().allow('').optional(),
  companyJa: Joi.string().max(100).trim().allow('').optional(),
  description: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .messages({
      'string.max': '설명은 5000자를 초과할 수 없습니다'
    }),
  descriptionEn: Joi.string().max(5000).trim().allow('').optional(),
  descriptionJa: Joi.string().max(5000).trim().allow('').optional(),
  // 🌟 카테고리별 상세 내용 (신규 - 다국어 지원)
  details: Joi.array()
    .items(
      Joi.object({
        category: Joi.string()
          .min(1)
          .max(100)
          .trim()
          .required()
          .messages({
            'string.min': '카테고리 이름은 1자 이상이어야 합니다',
            'string.max': '카테고리 이름은 100자를 초과할 수 없습니다',
            'any.required': '카테고리 이름은 필수입니다'
          }),
        categoryEn: Joi.string().max(100).trim().allow('').optional(),
        categoryJa: Joi.string().max(100).trim().allow('').optional(),
        items: Joi.array()
          .items(
            Joi.string()
              .min(1)
              .max(500)
              .trim()
          )
          .min(1)
          .max(50)
          .messages({
            'array.min': '카테고리에는 최소 1개의 항목이 필요합니다',
            'array.max': '카테고리당 최대 50개의 항목까지 입력 가능합니다',
            'string.min': '항목은 1자 이상이어야 합니다',
            'string.max': '항목은 500자를 초과할 수 없습니다'
          }),
        itemsEn: Joi.array().items(Joi.string().min(1).max(500).trim()).max(50).optional(),
        itemsJa: Joi.array().items(Joi.string().min(1).max(500).trim()).max(50).optional(),
        order: Joi.number().integer().min(0).optional()
      })
    )
    .max(10)
    .allow(null)
    .messages({
      'array.max': '카테고리는 최대 10개까지 입력 가능합니다'
    }),
  skills: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(50)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '기술 스택은 최대 20개까지 입력 가능합니다',
      'string.min': '기술명은 1자 이상이어야 합니다',
      'string.max': '기술명은 50자를 초과할 수 없습니다'
    }),
  skillsEn: Joi.array().items(Joi.string().min(1).max(50).trim()).max(20).optional(),
  skillsJa: Joi.array().items(Joi.string().min(1).max(50).trim()).max(20).optional(),
  // 🌟 스킬 ID 목록 (Skills 페이지와 연결)
  skillIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': '올바른 스킬 ID 형식이 아닙니다'
        })
    )
    .max(50)
    .default([])
    .messages({
      'array.max': '스킬은 최대 50개까지 연결 가능합니다'
    }),
  iconKey: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.min': '아이콘 키는 1자 이상이어야 합니다',
      'string.max': '아이콘 키는 50자를 초과할 수 없습니다'
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow('')
    .messages({
      'string.pattern.base': '색상은 #RRGGBB 형식이어야 합니다'
    }),
  bgColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow('')
    .messages({
      'string.pattern.base': '배경색은 #RRGGBB 형식이어야 합니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': '순서는 숫자여야 합니다',
      'number.integer': '순서는 정수여야 합니다',
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

const projectSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  titleEn: Joi.string().max(200).trim().allow('').optional(),
  titleJa: Joi.string().max(200).trim().allow('').optional(),
  description: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .messages({
      'string.max': '설명은 5000자를 초과할 수 없습니다'
    }),
  descriptionEn: Joi.string().max(5000).trim().allow('').optional(),
  descriptionJa: Joi.string().max(5000).trim().allow('').optional(),
  detailedDescription: Joi.string()
    .max(10000)
    .trim()
    .allow('')
    .messages({
      'string.max': '상세 설명은 10000자를 초과할 수 없습니다'
    }),
  detailedDescriptionEn: Joi.string().max(10000).trim().allow('').optional(),
  detailedDescriptionJa: Joi.string().max(10000).trim().allow('').optional(),
  technologies: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(50)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '기술 스택은 최대 20개까지 입력 가능합니다',
      'string.min': '기술명은 1자 이상이어야 합니다',
      'string.max': '기술명은 50자를 초과할 수 없습니다'
    }),
  technologiesEn: Joi.array().items(Joi.string().min(1).max(50).trim()).max(20).optional(),
  technologiesJa: Joi.array().items(Joi.string().min(1).max(50).trim()).max(20).optional(),
  category: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.min': '카테고리는 1자 이상이어야 합니다',
      'string.max': '카테고리는 50자를 초과할 수 없습니다'
    }),
  categoryIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'array.base': '카테고리 ID는 배열이어야 합니다'
    }),
  status: Joi.string()
    .valid('preparing', 'planning', 'completed')
    .default('preparing')
    .messages({
      'any.only': '상태는 preparing, planning, completed 중 하나여야 합니다'
    }),
  githubLink: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 GitHub URL 형식이어야 합니다'
    }),
  liveLink: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 라이브 링크 URL 형식이어야 합니다'
    }),
  image: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': '올바른 이미지 URL 형식이어야 합니다'
    }),
  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .messages({
      'array.max': '이미지는 최대 10개까지 업로드 가능합니다',
      'string.uri': '올바른 이미지 URL 형식이어야 합니다'
    }),
  imageDescriptions: Joi.array()
    .items(
      Joi.string()
        .max(5000)  // 🌟 HTML/Lexical 형식을 고려하여 5000자로 설정
        .trim()
        .allow('')
    )
    .max(10)
    .messages({
      'array.max': '이미지 설명은 최대 10개까지 입력 가능합니다',
      'string.max': '각 이미지 설명은 5000자를 초과할 수 없습니다 (HTML/Lexical 포함)'
    }),
  imageDescriptionsEn: Joi.array().items(Joi.string().max(5000).trim().allow('')).max(10).optional(),
  imageDescriptionsJa: Joi.array().items(Joi.string().max(5000).trim().allow('')).max(10).optional(),
  videos: Joi.array()
    .items(Joi.string().uri())
    .max(5)
    .messages({
      'array.max': '동영상은 최대 5개까지 업로드 가능합니다',
      'string.uri': '올바른 동영상 URL 형식이어야 합니다'
    }),
  videoDescriptions: Joi.array()
    .items(
      Joi.string()
        .max(5000)  // 🌟 HTML 형식을 고려하여 5000자로 증가
        .trim()
        .allow('')
    )
    .max(5)
    .messages({
      'array.max': '동영상 설명은 최대 5개까지 입력 가능합니다',
      'string.max': '각 동영상 설명은 5000자를 초과할 수 없습니다 (HTML 포함)'
    }),
  videoDescriptionsEn: Joi.array().items(Joi.string().max(5000).trim().allow('')).max(5).optional(),
  videoDescriptionsJa: Joi.array().items(Joi.string().max(5000).trim().allow('')).max(5).optional(),
  features: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(200)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '기능은 최대 20개까지 입력 가능합니다',
      'string.min': '기능명은 1자 이상이어야 합니다',
      'string.max': '기능명은 200자를 초과할 수 없습니다'
    }),
  featuresEn: Joi.array().items(Joi.string().min(1).max(200).trim()).max(20).optional(),
  featuresJa: Joi.array().items(Joi.string().min(1).max(200).trim()).max(20).optional(),
  learnings: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(500)
        .trim()
    )
    .max(20)
    .messages({
      'array.max': '학습 내용은 최대 20개까지 입력 가능합니다',
      'string.min': '학습 내용은 1자 이상이어야 합니다',
      'string.max': '학습 내용은 500자를 초과할 수 없습니다'
    }),
  learningsEn: Joi.array().items(Joi.string().min(1).max(500).trim()).max(20).optional(),
  learningsJa: Joi.array().items(Joi.string().min(1).max(500).trim()).max(20).optional(),
  // 🌟 프로젝트에서 사용된 스킬 ID 목록 (ObjectId 배열)
  skillIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId 형식 검증
        .messages({
          'string.pattern.base': '올바른 스킬 ID 형식이 아닙니다'
        })
    )
    .max(50)
    .default([])
    .messages({
      'array.max': '스킬은 최대 50개까지 연결 가능합니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': '순서는 숫자여야 합니다',
      'number.integer': '순서는 정수여야 합니다',
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

const contactMessageSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': '이름은 1자 이상이어야 합니다',
      'string.max': '이름은 100자를 초과할 수 없습니다',
      'any.required': '이름은 필수 입력 항목입니다'
    }),
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': '올바른 이메일 형식이어야 합니다',
      'string.max': '이메일은 255자를 초과할 수 없습니다',
      'any.required': '이메일은 필수 입력 항목입니다'
    }),
  subject: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 항목입니다'
    }),
  message: Joi.string()
    .min(1)
    .max(2000)
    .trim()
    .required()
    .messages({
      'string.min': '메시지는 1자 이상이어야 합니다',
      'string.max': '메시지는 2000자를 초과할 수 없습니다',
      'any.required': '메시지는 필수 입력 항목입니다'
    })
});

// =================================================================
// 📹 VideoLearning 스키마 (영상 학습 기록)
// =================================================================
const videoLearningSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 사항입니다'
    }),
  videoId: Joi.string()
    .length(11)
    .pattern(/^[a-zA-Z0-9_-]{11}$/)
    .trim()
    .required()
    .messages({
      'string.length': '유튜브 영상 ID는 11자여야 합니다',
      'string.pattern.base': '올바른 유튜브 영상 ID 형식이 아닙니다',
      'any.required': '영상 ID는 필수 입력 사항입니다'
    }),
  category: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.max': '카테고리는 50자를 초과할 수 없습니다'
    }),
  categoryIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'array.base': '카테고리 ID는 배열이어야 합니다'
    }),
  watchDate: Joi.date()
    .allow(null)
    .messages({
      'date.base': '올바른 날짜 형식이 아닙니다'
    }),
  purpose: Joi.string()
    .max(1000)
    .trim()
    .allow('')
    .messages({
      'string.max': '시청 목적은 1000자를 초과할 수 없습니다'
    }),
  keyTakeaways: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .messages({
      'string.max': '핵심 배움은 5000자를 초과할 수 없습니다'
    }),
  application: Joi.string()
    .max(3000)
    .trim()
    .allow('')
    .messages({
      'string.max': '적용 계획은 3000자를 초과할 수 없습니다'
    }),
  skillIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': '올바른 스킬 ID 형식이 아닙니다'
        })
    )
    .max(50)
    .default([])
    .messages({
      'array.max': '스킬은 최대 50개까지 연결 가능합니다'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .allow(null)
    .messages({
      'number.base': '평점은 숫자여야 합니다',
      'number.integer': '평점은 정수여야 합니다',
      'number.min': '평점은 1점 이상이어야 합니다',
      'number.max': '평점은 5점을 초과할 수 없습니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': '순서는 숫자여야 합니다',
      'number.integer': '순서는 정수여야 합니다',
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

// 🌟 유튜브 재생 목록 검증 스키마
const videoPlaylistSchema = Joi.object({
  playlistId: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]{13,}$/)
    .trim()
    .required()
    .messages({
      'string.pattern.base': '올바른 유튜브 재생 목록 ID 형식이 아닙니다',
      'any.required': '재생 목록 ID는 필수 입력 사항입니다'
    }),
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 사항입니다'
    }),
  purpose: Joi.string()
    .max(1000)
    .trim()
    .allow('')
    .messages({
      'string.max': '시청 목적은 1000자를 초과할 수 없습니다'
    }),
  application: Joi.string()
    .max(3000)
    .trim()
    .allow('')
    .messages({
      'string.max': '적용 계획은 3000자를 초과할 수 없습니다'
    }),
  skillIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': '올바른 스킬 ID 형식이 아닙니다'
        })
    )
    .max(50)
    .default([])
    .messages({
      'array.max': '스킬은 최대 50개까지 연결 가능합니다'
    }),
  category: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .messages({
      'string.max': '카테고리는 50자를 초과할 수 없습니다'
    }),
  categoryIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'array.base': '카테고리 ID는 배열이어야 합니다'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .allow(null)
    .messages({
      'number.min': '평점은 1점 이상이어야 합니다',
      'number.max': '평점은 5점을 초과할 수 없습니다'
    }),
  watchDate: Joi.date()
    .allow(null)
    .messages({
      'date.base': '올바른 날짜 형식이 아닙니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

// 🌟 재생 목록 내 개별 영상 검증 스키마
const playlistVideoSchema = Joi.object({
  playlistId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': '올바른 재생 목록 ID 형식이 아닙니다',
      'any.required': '재생 목록 ID는 필수 입력 사항입니다'
    }),
  videoId: Joi.string()
    .length(11)
    .pattern(/^[a-zA-Z0-9_-]{11}$/)
    .trim()
    .required()
    .messages({
      'string.length': '유튜브 영상 ID는 11자여야 합니다',
      'string.pattern.base': '올바른 유튜브 영상 ID 형식이 아닙니다',
      'any.required': '영상 ID는 필수 입력 사항입니다'
    }),
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': '제목은 1자 이상이어야 합니다',
      'string.max': '제목은 200자를 초과할 수 없습니다',
      'any.required': '제목은 필수 입력 사항입니다'
    }),
  keyTakeaways: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .messages({
      'string.max': '핵심 배움은 5000자를 초과할 수 없습니다'
    }),
  order: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.min': '순서는 0 이상이어야 합니다'
    })
});

// =================================================================
// 모듈 내보내기
// =================================================================

// =================================================================
// Skill 관련 스키마
// =================================================================

const skillSchema = Joi.object({
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': '올바른 카테고리 ID 형식이 아닙니다'
    }),
  name: Joi.string().max(50).allow('').optional().messages({
    'string.max': '스킬 이름은 50자를 초과할 수 없습니다'
  }),
  nameEn: Joi.string().max(50).allow('').optional(),
  nameJa: Joi.string().max(50).allow('').optional(),
  level: Joi.number().integer().min(0).max(100).optional().messages({
    'number.min': '레벨은 0 이상이어야 합니다',
    'number.max': '레벨은 100 이하여야 합니다'
  }),
  icon: Joi.string().max(50).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('').optional(),
  description: Joi.string().max(500).trim().allow('').optional(),
  descriptionEn: Joi.string().max(500).trim().allow('').optional(),
  descriptionJa: Joi.string().max(500).trim().allow('').optional(),
  projectIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  showInSidebar: Joi.boolean().optional(),
  showInLanguageCard: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional()
});

const skillCategorySchema = Joi.object({
  title: Joi.string().max(100).allow('').optional().messages({
    'string.max': '카테고리 제목은 100자를 초과할 수 없습니다'
  }),
  titleEn: Joi.string().max(100).allow('').optional(),
  titleJa: Joi.string().max(100).allow('').optional(),
  description: Joi.string().max(500).trim().allow('').optional(),
  descriptionEn: Joi.string().max(500).trim().allow('').optional(),
  descriptionJa: Joi.string().max(500).trim().allow('').optional(),
  icon: Joi.string().max(50).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow('').optional(),
  order: Joi.number().integer().min(0).optional()
});

// =================================================================
// 통합 카테고리 스키마
// =================================================================

const categorySchema = Joi.object({
  name: Joi.string().required().max(50).messages({
    'string.empty': '카테고리 이름은 필수입니다',
    'string.max': '카테고리 이름은 50자를 초과할 수 없습니다'
  }),
  nameEn: Joi.string().max(50).allow('').optional().messages({
    'string.max': '영어 카테고리 이름은 50자를 초과할 수 없습니다'
  }),
  nameJa: Joi.string().max(50).allow('').optional().messages({
    'string.max': '일본어 카테고리 이름은 50자를 초과할 수 없습니다'
  }),
  order: Joi.number().integer().min(0).default(0)
});

module.exports = {
  // 유틸리티 함수
  validateRequest,
  validateObjectId,
  
  // 인증 스키마
  adminLoginSchema,
  changePasswordSchema,
  
  // 데이터 모델 스키마
  categorySchema,
  skillSchema,
  skillCategorySchema,
  bookSchema,
  videoLearningSchema,
  videoPlaylistSchema,
  playlistVideoSchema,
  experienceSchema,
  projectSchema,
  contactMessageSchema
};
