import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useState, useEffect,  useRef } from 'react';
import { summarizeArticle } from '../services/api';

const ArticleModal = ({ article, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const summarizedRef = useRef(new Set())


  useEffect(() => {

    if (summarizedRef.current.has(article.id)) {
      return;
    }
    summarizedRef.current.add(article.id)
    loadSummary();

  }, [article.id]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await summarizeArticle(article.id);
      setSummary(data);
    } catch (err) {
      setError('Failed to generate AI summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="panel-outset bg-[#f5f2ea] max-w-3xl w-full max-h-[90vh] overflow-y-auto border-classic">
        <div className="sticky top-0 bg-[#f5f2ea] border-b-2 border-[#8b8577] p-4 flex justify-between items-start">
          <h2 className="text-xl font-bold text-[#2c2416] pr-8">{article.title}</h2>
          <button 
            onClick={onClose}
            className="btn-classic p-2 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-[#6b6558]">
            <span className="font-bold">{article.source}</span>
            {article.author && <span>• by {article.author}</span>}
            <span>• {article.timeAgo}</span>
          </div>

          {loading && (
            <div className="panel-inset p-6 border-classic mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#4a5f7f] border-t-transparent animate-spin"></div>
                <span className="text-[#6b6558] font-bold">Generating AI summary...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="panel-inset p-4 border-2 border-[#8b2e2e] bg-[#f8d7da] mb-4">
              <p className="text-[#8b2e2e] font-bold">{error}</p>
            </div>
          )}

          {summary && !loading && (
            <div className="panel-inset p-6 border-classic mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#4a5f7f]" />
                <h3 className="font-bold text-[#2c2416] uppercase tracking-wide">AI Summary</h3>
              </div>
              
              <p className="text-[#4a4234] mb-4 leading-relaxed">{summary.summary}</p>
              
              {summary.key_points && summary.key_points.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-[#2c2416] mb-2 uppercase text-sm">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.key_points.map((point, idx) => (
                      <li key={idx} className="text-[#4a4234]">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.tags && summary.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {summary.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-[#4a4234] bg-[#e8e4d9] px-2 py-1 border border-[#c9c4b5] uppercase tracking-wide font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="panel-inset p-4 border-classic mb-4">
            <h4 className="font-bold text-[#2c2416] mb-2 uppercase text-sm">Original Summary:</h4>
            <p className="text-[#4a4234] leading-relaxed">{article.excerpt}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.open(article.link, '_blank')}
              className="btn-classic-primary px-6 py-3 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Read Full Article</span>
            </button>
            <button
              onClick={onClose}
              className="btn-classic px-6 py-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
