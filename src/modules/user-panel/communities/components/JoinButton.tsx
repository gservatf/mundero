import React from "react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Loader2, UserPlus, UserMinus, Lock } from "lucide-react";

interface JoinButtonProps {
  communityId: string;
  isJoined: boolean;
  isPrivate: boolean;
  requiresApproval: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export const JoinButton: React.FC<JoinButtonProps> = ({
  communityId,
  isJoined,
  isPrivate,
  requiresApproval,
  isLoading = false,
  isPending = false,
  onJoin,
  onLeave,
  disabled = false,
  size = "default",
  variant = "default",
}) => {
  const handleClick = () => {
    if (isJoined) {
      onLeave(communityId);
    } else {
      onJoin(communityId);
    }
  };

  // Determine button state and text
  const getButtonState = () => {
    if (isPending) {
      return {
        text: "Solicitud Pendiente",
        icon: <Lock className="w-4 h-4" />,
        variant: "outline" as const,
        disabled: true,
      };
    }

    if (isJoined) {
      return {
        text: "Abandonar",
        icon: <UserMinus className="w-4 h-4" />,
        variant: "outline" as const,
        disabled: false,
      };
    }

    if (isPrivate) {
      return {
        text: requiresApproval ? "Solicitar Acceso" : "Unirse",
        icon: <UserPlus className="w-4 h-4" />,
        variant: variant,
        disabled: false,
      };
    }

    return {
      text: "Unirse",
      icon: <UserPlus className="w-4 h-4" />,
      variant: variant,
      disabled: false,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={buttonState.variant}
        size={size}
        onClick={handleClick}
        disabled={disabled || isLoading || buttonState.disabled}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isJoined ? "Abandonando..." : "Uniéndose..."}
          </>
        ) : (
          <>
            {buttonState.icon && (
              <span className="mr-2">{buttonState.icon}</span>
            )}
            {buttonState.text}
          </>
        )}
      </Button>

      {/* Status badges */}
      <div className="flex flex-wrap gap-1 justify-center">
        {isPrivate && (
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Privada
          </Badge>
        )}
        {requiresApproval && !isJoined && (
          <Badge variant="outline" className="text-xs">
            Requiere Aprobación
          </Badge>
        )}
        {isPending && (
          <Badge
            variant="secondary"
            className="text-xs bg-yellow-100 text-yellow-800"
          >
            Pendiente
          </Badge>
        )}
      </div>
    </div>
  );
};
