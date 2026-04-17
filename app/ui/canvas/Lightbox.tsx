import { useCanvasStore } from "@/app/ui/canvas/useCanvasStore";

export function Lightbox() {
  const { viewingElement, setViewingElement } = useCanvasStore();

  if (!viewingElement) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={() => setViewingElement(null)}
    >
      <button 
        className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white/50 hover:bg-white/20 hover:text-white transition-all"
        onClick={(e) => {
          e.stopPropagation();
          setViewingElement(null);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div 
        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {viewingElement.element_type === "text" ? (
          <div className="flex min-h-[300px] min-w-[300px] items-center justify-center bg-white/5 p-12 text-center">
            <h2 
              className="text-4xl text-white sm:text-6xl"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              {viewingElement.text_content}
            </h2>
          </div>
        ) : (
          <img 
            src={viewingElement.url} 
            alt="Full view" 
            className="h-full w-full object-contain"
          />
        )}
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {new Date(viewingElement.created_at).toLocaleDateString()} • {viewingElement.element_type}
          </div>
        </div>
      </div>
    </div>
  );
}
