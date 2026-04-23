import { useCanvasStore } from "@/app/ui/canvas/useCanvasStore";

export function Lightbox() {
  const { viewingElement, setViewingElement } = useCanvasStore();

  if (!viewingElement) return null;

  const getFrameClass = () => {
    if (viewingElement.element_type === "text" && (!viewingElement.frame || viewingElement.frame === "none")) return "";
    
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
        return "";
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
        className={`relative flex flex-col items-center max-h-[90vh] max-w-[95vw] transition-all duration-500 ${getFrameClass()}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center">
          {viewingElement.element_type === "text" ? (
            <div className={`flex min-h-[300px] min-w-[300px] items-center justify-center bg-black/5 dark:bg-white/5 p-12 text-center ${!viewingElement.frame || viewingElement.frame === "none" ? "rounded-3xl" : ""}`}>
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
              className={`max-w-[80vw] max-h-[70vh] object-contain transition-all duration-500 ${!viewingElement.frame || viewingElement.frame === "none" ? "rounded-3xl shadow-2xl" : ""}`}
            />
          )}
        </div>
        
        <div className="mt-4 flex w-full justify-center text-text-main/40">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] bg-bg-app/40 px-3 py-1.5 rounded-full backdrop-blur-xl border border-border-glass">
            {new Date(viewingElement.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
