import Spinner from '../ui/Spinner';

interface LoadingStateProps {
  readonly message?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly fullScreen?: boolean;
}

export default function LoadingState({ message = 'Loading...', size = 'md', fullScreen = false }: LoadingStateProps) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Spinner size={size} />
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
}