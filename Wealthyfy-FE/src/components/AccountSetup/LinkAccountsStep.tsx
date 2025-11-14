import { type StepWithBackProps } from "@/types/step";

interface LinkAccountsStepProps extends StepWithBackProps {
  consentUrl: string;
}

function LinkAccountsStep({ onNext, consentUrl }: LinkAccountsStepProps) {

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: 0, maxWidth: '100%', width: '100%' }}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Link Your Bank Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
           Complete the consent process in the window below to link your accounts and proceed with data retrieval.
          </p>
        </div>
      </div>
      <div 
        className="flex-1 w-full border rounded-lg overflow-hidden bg-background shadow-sm"
        style={{ minHeight: '500px', height: '100%', width: '100%' }}
      >
        <iframe
          src={consentUrl}
          className="w-full h-full border-0"
          title="Bank Account Linking"
          allow="payment; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default LinkAccountsStep;

