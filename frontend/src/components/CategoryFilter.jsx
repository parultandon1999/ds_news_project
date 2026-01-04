const CategoryFilter = ({ categories, activeFilter, setActiveFilter }) => {
  return (
    <div className="mb-3 sm:mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap uppercase tracking-wide transition-all ${
              activeFilter === cat
                ? 'btn-classic-primary'
                : 'btn-classic'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
