import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, DocumentTextIcon, ArrowDownTrayIcon, EyeIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  title: string;
  type: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  patientName?: string;
}

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Hujjat o\'chirildi');
      loadDocuments();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const filtered = documents.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.type?.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'pdf': 'bg-red-100 text-red-700',
      'doc': 'bg-blue-100 text-blue-700',
      'docx': 'bg-blue-100 text-blue-700',
      'xls': 'bg-green-100 text-green-700',
      'xlsx': 'bg-green-100 text-green-700',
      'image': 'bg-purple-100 text-purple-700',
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hujjatlar</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Yangi qo'shish
        </button>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Hujjat qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hujjat</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Turi</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Bemor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Sana</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-600">{doc.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                      {doc.type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doc.patientName || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(doc.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Ko'rish">
                        <EyeIcon className="w-5 h-5 text-gray-600" />
                      </button>
                      <a
                        href={doc.fileUrl}
                        download
                        className="p-2 hover:bg-blue-50 rounded-lg"
                        title="Yuklab olish"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
                      </a>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="O'chirish"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Hujjatlar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
};
