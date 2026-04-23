import { useCanvasStore } from "@/app/ui/canvas/useCanvasStore";

export function Lightbox() {
  const { viewingElement, setViewingElement } = useCanvasStore();

  if (!viewingElement) return null;

  const getFrameClass = () => {
    if (viewingElement.element_type === "text") return "";
    switch (viewingElement.frame) {
      case "polaroid":
        return "bg-white p-4 pb-16 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-sm";
      case "minimal":
        return "bg-white p-1 shadow-xl rounded-sm";
      case "canvas":
        return "bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-sm";
      case "modern":
        return "bg-[#111] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-sm";
      default:
        return "rounded-2xl overflow-hidden";
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-app/80 backdrop-blur-xl animate-in fade-in duration-300 p-6"
      onClick={() => setViewingElement(null)}
    >
      <button 
        className="absolute right-6 top-6 rounded-full bg-black/5 dark:bg-white/5 p-2 text-text-main hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100 transition-all z-[110]"
        onClick={(e) => {
          e.stopPropagation();
          setViewingElement(null);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div 
        className={`relative max-h-[85vh] max-w-[90vw] transition-all duration-500 ${getFrameClass()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {viewingElement.element_type === "text" ? (
          <div className="flex min-h-[300px] min-w-[300px] items-center justify-center bg-black/5 dark:bg-white/5 p-12 text-center rounded-2xl overflow-hidden">
            <h2 
              className="text-4xl text-text-main sm:text-6xl"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {viewingElement.text_content}
            </h2>
          </div>
        ) : (
          <img 
            src={viewingElement.url} 
            alt="Full view" 
            className="max-w-[80vw] max-h-[70vh] object-contain"
          />
        )}
        
        <div className={`absolute inset-x-0 bottom-0 p-6 pt-12 text-text-main/80`}>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] bg-bg-glass/40 p-2 rounded-lg backdrop-blur-xl w-fit">
            {new Date(viewingElement.created_at).toLocaleDateString()} • {viewingElement.element_type}
          </div>
        </div>
      </div>
    </div>
  );
}
