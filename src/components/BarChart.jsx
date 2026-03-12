export default function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.views));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const height = Math.round((d.views / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-semibold transition-all ${isLast ? 'text-black' : 'text-black/30'}`}>
              {d.views}
            </span>
            <div className="w-full relative group">
              <div
                className={`w-full rounded-t-md transition-all duration-500 cursor-default
                  ${isLast ? 'bg-[#d4f53c]' : 'bg-black/10 group-hover:bg-black/20'}`}
                style={{ height: `${Math.max(height * 0.8, 6)}px` }}
              />
            </div>
            <span className="text-[9px] text-black/40 tracking-wider">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
