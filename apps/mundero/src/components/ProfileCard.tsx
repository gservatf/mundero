import { Card, CardContent, CardHeader } from "@ui/card";
import { Button } from "@ui/button";
import { MapPin, Briefcase, Edit, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";

interface ProfileCardProps {
  profile?: UserProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function ProfileCard({
  profile,
  isOwnProfile = false,
  onEdit,
}: ProfileCardProps) {
  const { user } = useAuth();

  if (!profile && !user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Perfil no encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const displayProfile = profile || {
    id: user?.uid || "",
    full_name: user?.displayName || "",
    email: user?.email || "",
    avatar_url: user?.photoURL || "",
    username: user?.email?.split("@")[0] || "",
    title: "",
    bio: "",
    location: "",
    skills: [],
    public_profile: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto mb-4">
          <img
            src={
              displayProfile.avatar_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${displayProfile.full_name}`
            }
            alt={displayProfile.full_name}
            className="w-24 h-24 rounded-full border-4 border-background shadow-lg"
          />
          {isOwnProfile && (
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{displayProfile.full_name}</h2>
          <p className="text-muted-foreground">@{displayProfile.username}</p>
          {displayProfile.title && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 mr-1" />
              {displayProfile.title}
            </div>
          )}
          {displayProfile.location && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {displayProfile.location}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayProfile.bio && (
          <div>
            <h3 className="font-semibold mb-2">Acerca de</h3>
            <p className="text-sm text-muted-foreground">
              {displayProfile.bio}
            </p>
          </div>
        )}

        {displayProfile.skills && displayProfile.skills.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Habilidades</h3>
            <div className="flex flex-wrap gap-1">
              {displayProfile.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Perfil público</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(`/u/${displayProfile.username}`, "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Ver perfil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
