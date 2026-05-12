export default function Header({ onReset, onSave, onLogin, isEditMode, stats }) {
  const pct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xl">📖</span>
        <span className="font-bold text-slate-800 text-lg">SSV Scheduling</span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-3 max-w-md">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {stats.completed}/{stats.total} Finished ({pct}%)
        </span>
      </div>

      {/* Stage counts */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          Prep: {stats.prep}
        </span>
        <span
          className="px-2 py-0.5 rounded-full font-medium text-orange-900"
          style={{ background: 'repeating-linear-gradient(-45deg, #f3e8ff, #f3e8ff 6px, #ffedd5 6px, #ffedd5 12px)' }}
        >
          Check: {stats.check}
        </span>
        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
          Finalize: {stats.finalize}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isEditMode ? (
          <>
            <button
              onClick={onSave}
              className="text-xs text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
              title="Save schedule to file"
            >
              Save
            </button>
            <button
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Reset all data"
            >
              Reset
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="text-xs text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
            title="Login to edit schedule"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
