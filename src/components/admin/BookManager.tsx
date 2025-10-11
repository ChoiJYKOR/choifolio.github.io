import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaBook, FaStar } from 'react-icons/fa'
import { Book, BookFormData, Learning, Chapter } from '../../types'
import BookForm from '../forms/BookForm'
import ChapterForm from '../forms/ChapterForm'
import LearningForm from '../forms/LearningForm'
import ChapterLearningList from '../common/ChapterLearningList'
import ToastContainer from '../common/Toast'
import { useBookManagerData } from '../../hooks/useBookManagerData'
import { useCRUDManager } from '../../hooks/useCRUDManager'
import { useOptimisticArrayUpdate } from '../../hooks/useOptimisticUpdate'
import { useAbortController } from '../../hooks/useAbortController'
import { useToastHelpers } from '../../hooks/useToast'
import { chaptersAPI, learningsAPI } from '../../services/api'
import { formatDate } from '../../utils/dateUtils'

interface BookManagerProps {
  bookFilter?: 'all' | 'five-star' | 'category'
  bookSearchTerm?: string
  selectedBookCategory?: string
  initialEditId?: string  // 🌟 URL state로 전달된 수정 대상 ID
}

const BookManager: React.FC<BookManagerProps> = ({ 
  bookFilter = 'all', 
  bookSearchTerm = '', 
  selectedBookCategory = '',
  initialEditId  // 🌟 초기 수정 ID 받기
}) => {
  const { books, isLoading, createBook, updateBook, deleteBook } = useBookManagerData()
  const { success, error } = useToastHelpers()
  const { createAbortController } = useAbortController()
  
  // Toast 상태
  const { toasts, hideToast } = useToastHelpers()
  
  // 서적 CRUD 관리
  const [bookState, bookActions] = useCRUDManager<Book>({
    onSave: async (data: BookFormData, editingItem) => {
      console.log('📚 BookManager - 저장 시작:', data)
      console.log('🔗 skillIds:', data.skillIds)
      
      if (editingItem) {
        console.log('✏️ 서적 수정 모드:', editingItem._id)
        const result = await updateBook(editingItem._id, data)
        console.log('✅ 수정 결과:', result)
        success('서적 수정 완료', '서적 정보가 성공적으로 수정되었습니다.')
      } else {
        console.log('➕ 서적 생성 모드')
        const result = await createBook(data)
        console.log('✅ 생성 결과:', result)
        success('서적 추가 완료', '새로운 서적이 성공적으로 추가되었습니다.')
      }
    },
    onDelete: async (book: Book) => {
      await deleteBook(book._id)
      success('서적 삭제 완료', `${book.title}이(가) 삭제되었습니다.`)
    },
    onError: (err) => {
      console.error('❌ 서적 저장 실패:', err)
      error('작업 실패', err.message || '알 수 없는 오류가 발생했습니다.')
    }
  })

  // 목차 낙관적 업데이트
  const {
    data: chapters,
    optimisticAdd: optimisticAddChapter,
    optimisticUpdateItem: optimisticUpdateChapter,
    optimisticDelete: optimisticDeleteChapter,
    resetData: resetChapters
  } = useOptimisticArrayUpdate<Chapter>([])

  // 학습 내용 낙관적 업데이트 (현재는 사용하지 않지만 향후 확장을 위해 유지)
  // const {
  //   data: learnings,
  //   optimisticAdd: optimisticAddLearning,
  //   optimisticUpdateItem: optimisticUpdateLearning,
  //   optimisticDelete: optimisticDeleteLearning,
  //   resetData: resetLearnings
  // } = useOptimisticArrayUpdate<Learning>([])

  // 서적 상세보기 모달 상태
  const [showBookDetailModal, setShowBookDetailModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)

  // 폼 상태
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [showLearningForm, setShowLearningForm] = useState(false)
  const [editingLearning, setEditingLearning] = useState<Learning | null>(null)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)  // 🌟 자동 열림 추적

  // 🌟 initialEditId가 전달되면 자동으로 해당 서적 수정 모드로 전환 (한 번만)
  useEffect(() => {
    if (initialEditId && books.length > 0 && !hasAutoOpened) {
      const bookToEdit = books.find(book => book._id === initialEditId)
      if (bookToEdit) {
        console.log('🎯 자동 수정 모드 활성화:', bookToEdit.title)
        bookActions.handleEdit(bookToEdit)
        setHasAutoOpened(true)  // 🌟 한 번만 실행되도록 표시
      }
    }
  }, [initialEditId, books, hasAutoOpened, bookActions])

  // 필터링된 서적 목록 계산
  const filteredBooks = useMemo(() => {
    let filtered = [...books]

    // 필터 적용
    if (bookFilter === 'five-star') {
      filtered = filtered.filter(book => book.rating === 5)
    } else if (bookFilter === 'category' && selectedBookCategory) {
      filtered = filtered.filter(book => book.category === selectedBookCategory)
    }

    // 검색어 적용
    if (bookSearchTerm) {
      const searchLower = bookSearchTerm.toLowerCase()
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.category.toLowerCase().includes(searchLower)
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [books, bookFilter, bookSearchTerm, selectedBookCategory])

  // 서적 상세보기 모달 열기
  const handleBookDetailClick = useCallback(async (book: Book) => {
    setSelectedBook(book)
    setShowBookDetailModal(true)
    setSelectedChapterId(null)

    try {
      const abortController = createAbortController()
      
      // 목차만 가져오기 (학습 내용은 populate되어 있음)
      const chaptersResponse = await chaptersAPI.getByBook(book._id)

      if (!abortController.signal.aborted) {
        resetChapters(chaptersResponse.data || [])
      }
    } catch (err) {
      if (!(err as Error).name?.includes('AbortError')) {
        error('데이터 로드 실패', '서적 정보를 불러오는데 실패했습니다.')
      }
    }
  }, [createAbortController, resetChapters, error])

  // 목차 관리 핸들러들
  const handleSaveChapter = useCallback(async (chapterData: { title: string; order: number }) => {
    if (!selectedBook) return

    try {
      if (editingChapter) {
        // 수정
        await optimisticUpdateChapter(
          editingChapter._id,
          chapterData,
          () => chaptersAPI.update(selectedBook._id, editingChapter._id, chapterData).then(res => res.data)
        )
        success('목차 수정 완료', '목차가 성공적으로 수정되었습니다.')
        setShowChapterForm(false)
        setEditingChapter(null)
      } else {
        // 추가
        await optimisticAddChapter(
          { ...chapterData, _id: '', learnings: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Chapter,
          () => chaptersAPI.create(selectedBook._id, chapterData).then(res => res.data)
        )
        success('목차 추가 완료', '새로운 목차가 추가되었습니다.')
        setShowChapterForm(false)
      }
    } catch (err) {
      error('목차 작업 실패', '목차 작업에 실패했습니다.')
    }
  }, [selectedBook, editingChapter, optimisticAddChapter, optimisticUpdateChapter, success, error])

  const handleDeleteChapter = useCallback(async (chapter: Chapter) => {
    if (!selectedBook) return

    try {
      await optimisticDeleteChapter(
        chapter._id,
        () => chaptersAPI.delete(selectedBook._id, chapter._id).then(() => {})
      )
      success('목차 삭제 완료', '목차가 삭제되었습니다.')
    } catch (err) {
      error('목차 삭제 실패', '목차 삭제에 실패했습니다.')
    }
  }, [selectedBook, optimisticDeleteChapter, success, error])

  // 학습 내용 관리 핸들러들
  const handleAddLearningClick = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId)
    setShowLearningForm(true)
    setEditingLearning(null)
  }, [])

  const handleEditLearningClick = useCallback((learning: Learning, chapterId: string) => {
    setSelectedChapterId(chapterId)
    setEditingLearning(learning)
    setShowLearningForm(true)
  }, [])

  const handleDeleteLearningClick = useCallback(async (learning: Learning, chapterId: string) => {
    if (!selectedBook) return

    try {
      await learningsAPI.deleteForChapter(selectedBook._id, chapterId, learning._id)
      
      // 목차 데이터 새로고침 (학습 내용이 populate되어 있음)
      const chaptersResponse = await chaptersAPI.getByBook(selectedBook._id)
      resetChapters(chaptersResponse.data || [])
      
      success('학습 내용 삭제 완료', '학습 내용이 삭제되었습니다.')
    } catch (err) {
      error('학습 내용 삭제 실패', '학습 내용 삭제에 실패했습니다.')
    }
  }, [selectedBook, resetChapters, success, error])

  const handleSaveLearning = useCallback(async (learningData: { topic: string; content: string }) => {
    if (!selectedBook || !selectedChapterId) return

    try {
      if (editingLearning) {
        // 수정
        await learningsAPI.updateForChapter(selectedBook._id, selectedChapterId, editingLearning._id, learningData)
        success('학습 내용 수정 완료', '학습 내용이 성공적으로 수정되었습니다.')
      } else {
        // 추가
        await learningsAPI.createForChapter(selectedBook._id, selectedChapterId, learningData)
        success('학습 내용 추가 완료', '새로운 학습 내용이 추가되었습니다.')
      }
      
      // 목차 데이터 새로고침
      const chaptersResponse = await chaptersAPI.getByBook(selectedBook._id)
      resetChapters(chaptersResponse.data || [])
      
      setShowLearningForm(false)
      setEditingLearning(null)
      setSelectedChapterId(null)
    } catch (err) {
      error('작업 실패', '학습 내용 저장에 실패했습니다.')
    }
  }, [selectedBook, selectedChapterId, editingLearning, resetChapters, success, error])

  // 별점 렌더링
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar 
            key={i} 
            className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {/* Toast 알림 */}
      <ToastContainer toasts={toasts} onClose={hideToast} />

      <div className="space-y-6">
        {/* 🌟 헤더 및 서적 추가 버튼 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">서적 관리</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              총 {filteredBooks.length}권의 서적
            </p>
          </div>
          <button
            onClick={bookActions.handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaPlus />
            서적 추가
          </button>
        </div>

        {/* 🌟 서적 리스트 (테이블 형식) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                등록된 서적이 없습니다
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                상단의 '서적 추가' 버튼을 눌러 새로운 서적을 등록하세요
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      서적 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      저자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      평점
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      읽은 날짜
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBooks.map((book) => (
                    <tr 
                      key={book._id} 
                      onClick={() => handleBookDetailClick(book)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center shadow-sm">
                              <FaBook className="text-white text-lg" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {book.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {book.learnings?.length || 0}개의 학습 내용
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-300">
                          {book.author}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {renderRating(book.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-300">
                          {formatDate(book.readDate)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookDetailClick(book)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="상세보기"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              bookActions.handleEdit(book)
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
                            title="수정"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              bookActions.handleDelete(book)
                            }}
                            disabled={bookState.isDeleting}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
                            title="삭제"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 서적 폼 모달 */}
        {bookState.showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {bookState.editingItem ? '서적 수정' : '서적 추가'}
                  </h2>
                  <button
                    onClick={bookActions.handleCancel}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                <BookForm
                  data={bookState.editingItem}
                  onSave={bookActions.handleSave}
                  onCancel={bookActions.handleCancel}
                  isSaving={bookState.isSaving}
                />
              </div>
            </div>
          </div>
        )}

        {/* 🌟 서적 상세보기 모달 */}
        {showBookDetailModal && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
              {/* 🌟 고정 헤더 */}
              <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {selectedBook.coverImage ? (
                      <img 
                        src={selectedBook.coverImage} 
                        alt={selectedBook.title}
                        className="w-20 h-28 object-cover rounded shadow-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center shadow-lg flex-shrink-0">
                        <FaBook className="text-white text-2xl" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                        {selectedBook.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        저자: {selectedBook.author}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {selectedBook.category}
                        </span>
                        {renderRating(selectedBook.rating)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowBookDetailModal(false)
                      setSelectedChapterId(null)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* 🌟 스크롤 가능한 콘텐츠 영역 */}
              <div className="flex-1 overflow-y-auto p-6">
                <ChapterLearningList
                  chapters={chapters}
                  onAddChapter={() => {
                    setShowChapterForm(true)
                    setEditingChapter(null)
                  }}
                  onEditChapter={(chapter) => {
                    setEditingChapter(chapter)
                    setShowChapterForm(true)
                  }}
                  onDeleteChapter={handleDeleteChapter}
                  onAddLearning={handleAddLearningClick}
                  onEditLearning={handleEditLearningClick}
                  onDeleteLearning={handleDeleteLearningClick}
                  isAuthenticated={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* 🌟 목차 폼 모달 */}
        {showChapterForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-2xl">
              <ChapterForm
                chapter={editingChapter}
                onSave={handleSaveChapter}
                onCancel={() => {
                  setShowChapterForm(false)
                  setEditingChapter(null)
                }}
              />
            </div>
          </div>
        )}

        {/* 🌟 학습 내용 폼 모달 */}
        {showLearningForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <LearningForm
                learning={editingLearning}
                onSave={handleSaveLearning}
                onCancel={() => {
                  setShowLearningForm(false)
                  setEditingLearning(null)
                  setSelectedChapterId(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default BookManager
