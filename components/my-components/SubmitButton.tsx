import { Loader } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

type SubmitButtonProps = {
  isSubmitting?: boolean;
  disabled?: boolean;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting = false,
  disabled = false,
}) => {
  const showSpinner = isSubmitting; // `useFormStatus` removed, not needed for client forms

  return (
    <Button
      className="w-full"
      type="submit"
      disabled={disabled || isSubmitting}
    >
      {showSpinner ? (
        <Loader className="animate-spin w-5 h-5" /> // Consistent size for spinner
      ) : (
        "Submit"
      )}
    </Button>
  );
};

export default SubmitButton;
