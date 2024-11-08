import { AlertTriangle } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-2">
      <AlertTriangle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormError;
