import { Loader } from "lucide-react";
import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

type SubmitButtonProps = {
  isSubmitting?: boolean;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting = false,
}) => {
  const { pending } = useFormStatus();

  // Show the spinner if either `pending` or `isSubmitting` is true
  const showSpinner = pending || isSubmitting;

  return (
    <Button
      className="w-full"
      type="submit"
      disabled={isSubmitting} // Optionally disable button while submitting
    >
      {showSpinner ? (
        <Loader className="animate-spin text-2xl" /> // Increased size to 2xl
      ) : (
        "Submit"
      )}
    </Button>
  );
};

export default SubmitButton;
