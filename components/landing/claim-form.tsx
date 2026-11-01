import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ClaimFormProps = {
  variant?: "primary" | "action";
};

export function ClaimForm({ variant = "primary" }: ClaimFormProps) {
  return (
    <form
      action="/signup"
      method="get"
      className="flex max-w-[480px] flex-wrap gap-2.5"
    >
      <div className="min-w-0 flex-1 basis-[220px]">
        <label htmlFor="claim-handle" className="sr-only">
          Your Linkbase handle
        </label>
        <Input
          id="claim-handle"
          name="handle"
          prefix="linkbase.co/"
          placeholder="yourname"
          autoComplete="off"
          wrapperStyle={{
            background: "var(--lb-white)",
            boxShadow: "var(--shadow-xs)",
          }}
        />
      </div>
      <Button type="submit" variant={variant} size="md">
        Claim your Linkbase
      </Button>
    </form>
  );
}
