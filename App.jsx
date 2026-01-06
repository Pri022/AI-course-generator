import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { BookOpen, ChevronRight, ChevronLeft, Trophy, Sparkles, Check, X, ArrowRight } from 'lucide-react';

function App() {
  const [courseData, setCourseData] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizState, setQuizState] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedModules, setCompletedModules] = useState(new Set());

  const themeColor = courseData?.theme_color || '#6366f1';
  const courseIcon = courseData?.course_icon || '📖';

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/test-upload", { 
        method: "POST", 
        body: formData 
      });
      const data = await response.json();
      setCourseData(data);
      setActiveModule(0);
      setQuizState({});
      setCompletedModules(new Set());
    } catch (err) {
      alert("Backend connection failed!");
    } finally {
      setLoading(false);
    }
  };

  // Mark module as completed when quiz is answered correctly
  useEffect(() => {
    if (courseData?.modules[activeModule]?.quiz) {
      const quizAnswer = quizState[activeModule];
      const correctAnswer = courseData.modules[activeModule].quiz.correct_answer_index;
      if (quizAnswer === correctAnswer) {
        setCompletedModules(prev => new Set([...prev, activeModule]));
      }
    }
  }, [quizState, activeModule, courseData]);

  // Confetti effect when course is completed
  useEffect(() => {
    if (courseData && completedModules.size === courseData.modules.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [completedModules, courseData]);

  // --- Initial Welcome Screen ---
  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="z-10 text-center px-4">
          <div className="mb-8 inline-block">
            <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-7xl font-black text-white mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            AI Course Generator
          </h1>
          <p className="text-slate-300 mb-12 text-xl max-w-md mx-auto">
            Transform any PDF into an interactive learning experience powered by AI
          </p>
          
          <div className="p-1 w-full max-w-md mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50">
            <div className="bg-slate-900 p-16 rounded-[22px] border border-slate-800">
               <input type="file" onChange={handleUpload} className="hidden" id="fileInput" accept=".pdf" />
               <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-6 group">
                  <div className="text-8xl group-hover:scale-110 transition-transform">
                    {loading ? "⚡" : "📄"}
                  </div>
                  <span className="text-sm font-black text-slate-400 tracking-widest uppercase group-hover:text-purple-400 transition-colors">
                    {loading ? "Creating Your Course..." : "Upload PDF Document"}
                  </span>
                  {loading && (
                    <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    </div>
                  )}
               </label>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Interactive Quizzes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Instant Generation</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = courseData.modules[activeModule];
  const progress = ((activeModule + 1) / courseData.modules.length) * 100;
  const completionRate = (completedModules.size / courseData.modules.length) * 100;

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 relative">
      
      {/* Confetti celebration */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-ping"
              style={{
                backgroundColor: ['#fbbf24', '#f472b6', '#a78bfa', '#60a5fa'][i % 4],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-80 border-r border-slate-200 flex flex-col bg-white shadow-xl z-20">
        <div className="p-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl filter drop-shadow-lg">{courseIcon}</span>
            <div className="flex-1">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs font-bold text-slate-500">
                {activeModule + 1} of {courseData.modules.length} modules
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              Current Course
            </h2>
            <h3 className="text-xl font-bold text-slate-800 leading-snug">
              {courseData.course_title}
            </h3>
          </div>
          
          {/* Completion stats */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <Trophy className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-black text-green-600">{completedModules.size}</div>
              <div className="text-xs text-green-600 font-bold">Completed</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {courseData.modules.map((mod, idx) => {
            const isCompleted = completedModules.has(idx);
            const isActive = activeModule === idx;
            
            return (
              <button 
                key={idx} 
                onClick={() => { 
                  setActiveModule(idx); 
                  document.getElementById('main-content').scrollTo({top: 0, behavior: 'smooth'}); 
                }}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200 text-white scale-[1.02]' 
                    : isCompleted
                    ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                  }`}
              >
                {/* Module number badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                  }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                
                <span className={`text-sm font-bold leading-tight flex-1
                  ${isActive ? 'text-white' : isCompleted ? 'text-green-700' : 'text-slate-700'}`}>
                  {mod.title}
                </span>
                
                {isActive && <ChevronRight className="w-5 h-5 text-white" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={() => setCourseData(null)} 
            className="w-full py-3 rounded-xl text-xs font-black text-slate-500 hover:text-white hover:bg-red-500 transition-all uppercase tracking-widest border-2 border-slate-200 hover:border-red-500"
          >
            Exit Course
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main id="main-content" className="flex-1 overflow-y-auto scroll-smooth bg-gradient-to-br from-white to-slate-50 relative">
        {/* Dynamic background elements */}
        <div 
          className="absolute top-0 right-0 w-[50%] h-[50%] opacity-5 pointer-events-none rounded-full blur-[120px] transition-all duration-1000"
          style={{ backgroundColor: themeColor }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-[40%] h-[40%] opacity-5 pointer-events-none rounded-full blur-[100px] transition-all duration-1000"
          style={{ backgroundColor: themeColor }}
        ></div>

        <div className="max-w-4xl mx-auto py-24 px-12 relative">
          
          {/* Module header */}
          <header className="mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6 border border-slate-100">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                Module {activeModule + 1}
              </span>
            </div>
            
            <h1 className="text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              {current.title}
            </h1>
            
            <div 
              className="text-2xl font-medium leading-relaxed border-l-4 pl-8 py-4 italic text-slate-700 bg-white/50 backdrop-blur rounded-r-2xl shadow-sm" 
              style={{ borderColor: themeColor }}
            >
              {current.summary_highlight}
            </div>
          </header>

          {/* Key takeaways */}
          <section className="space-y-8 mb-32">
            {current.key_takeaways.map((point, i) => (
              <div 
                key={i} 
                className="group relative pl-12 p-6 rounded-2xl hover:bg-white/60 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Animated indicator */}
                <div 
                  className="absolute left-0 top-6 w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs transition-all duration-300 group-hover:scale-125 shadow-lg" 
                  style={{ backgroundColor: themeColor }}
                >
                  {i + 1}
                </div>
                
                <div className="text-xl text-slate-700 leading-relaxed prose prose-slate max-w-none prose-strong:text-slate-900 prose-strong:font-black">
                  <Markdown>{point}</Markdown>
                </div>
              </div>
            ))}
          </section>

          {/* --- ENHANCED QUIZ SECTION --- */}
          {current.quiz && (
            <div className="mt-48 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[40px] opacity-10 blur-xl"></div>
              
              <div className="relative p-12 rounded-[32px] bg-white border-2 border-slate-100 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-xs font-black uppercase tracking-widest border-2 border-blue-100" style={{ color: themeColor }}>
                    <Sparkles className="w-4 h-4" />
                    Knowledge Check
                  </span>
                  <div className="flex items-center gap-3">
                    {quizState[activeModule] === current.quiz.correct_answer_index && (
                      <div className="flex items-center gap-2 text-green-600 font-bold animate-in fade-in slide-in-from-right">
                        <Trophy className="w-5 h-5" />
                        <span>Module Complete!</span>
                      </div>
                    )}
                    {quizState[activeModule] !== undefined && (
                      <button
                        onClick={() => {
                          const newState = {...quizState};
                          delete newState[activeModule];
                          setQuizState(newState);
                          setCompletedModules(prev => {
                            const updated = new Set(prev);
                            updated.delete(activeModule);
                            return updated;
                          });
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
                
                <h4 className="text-3xl font-bold text-slate-800 mb-10 leading-snug">
                  {current.quiz.question}
                </h4>
                
                <div className="grid gap-4">
                  {current.quiz.options.map((opt, idx) => {
                    const isSelected = quizState[activeModule] === idx;
                    const isCorrect = idx === current.quiz.correct_answer_index;
                    const hasAnswered = quizState[activeModule] !== undefined;
                    const shouldHighlight = hasAnswered && (isSelected || isCorrect);
                    
                    return (
                      <button 
                        key={idx}
                        onClick={() => !hasAnswered && setQuizState({ ...quizState, [activeModule]: idx })}
                        disabled={hasAnswered}
                        className={`p-6 text-left rounded-2xl border-2 transition-all font-bold text-lg flex justify-between items-center group relative overflow-hidden
                          ${!hasAnswered
                            ? 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                            : shouldHighlight
                              ? isCorrect && isSelected
                                ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-200 scale-[1.02]'
                                : isCorrect
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-red-500 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl shadow-red-200'
                              : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                          }`}
                      >
                        {!hasAnswered && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        )}
                        
                        <span className="relative z-10">{opt}</span>
                        
                        {shouldHighlight && (
                          <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 animate-in zoom-in">
                            {isCorrect && isSelected ? (
                              <Check className="w-5 h-5" />
                            ) : isCorrect ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Feedback */}
                {quizState[activeModule] !== undefined && (
                  <div className={`mt-8 p-6 rounded-2xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500
                    ${quizState[activeModule] === current.quiz.correct_answer_index
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                        ${quizState[activeModule] === current.quiz.correct_answer_index
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-500 text-white'
                        }`}
                      >
                        {quizState[activeModule] === current.quiz.correct_answer_index ? (
                          <Trophy className="w-6 h-6" />
                        ) : (
                          <Sparkles className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-black text-lg mb-2
                          ${quizState[activeModule] === current.quiz.correct_answer_index
                            ? 'text-green-700'
                            : 'text-orange-700'
                          }`}
                        >
                          {quizState[activeModule] === current.quiz.correct_answer_index 
                            ? "Perfect! You've mastered this concept! 🎉" 
                            : "Good try! Let's learn from this 📚"}
                        </p>
                        <p className={`leading-relaxed
                          ${quizState[activeModule] === current.quiz.correct_answer_index
                            ? 'text-green-600'
                            : 'text-orange-600'
                          }`}
                        >
                          {current.quiz.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Footer Navigation */}
          <footer className="mt-32 pt-12 border-t-2 border-slate-100 flex justify-between items-center">
            <button 
              disabled={activeModule === 0}
              onClick={() => {
                setActiveModule(activeModule - 1);
                document.getElementById('main-content').scrollTo({top: 0, behavior: 'smooth'});
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none border-2 border-transparent hover:border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            {activeModule < courseData.modules.length - 1 ? (
              <button 
                onClick={() => { 
                  setActiveModule(activeModule + 1); 
                  document.getElementById('main-content').scrollTo({top: 0, behavior: 'smooth'}); 
                }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all"
                style={{ 
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
                }}
              >
                Next Module
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black shadow-xl">
                <Trophy className="w-6 h-6" />
                Course Completed!
              </div>
            )}
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;