import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export default function EmptyState({ message = '没有找到符合条件的场馆', subMessage = '试试调整筛选条件或搜索关键词' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 text-base font-medium mb-1">{message}</p>
      <p className="text-gray-400 text-sm">{subMessage}</p>
    </div>
  );
}
