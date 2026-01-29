import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Users, Compass } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const AboutModal = ({ open, onClose }: AboutModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">
              Campus Navigation System
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground leading-relaxed">
            This system helps users navigate inside a college campus by finding
            the shortest and easiest routes between buildings.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Navigation className="w-4 h-4" />}
              title="Smart Routing"
              description="Optimal paths between locations"
            />
            <FeatureCard
              icon={<Compass className="w-4 h-4" />}
              title="Easy Navigation"
              description="Simple, intuitive interface"
            />
            <FeatureCard
              icon={<MapPin className="w-4 h-4" />}
              title="All Locations"
              description="Complete campus coverage"
            />
            <FeatureCard
              icon={<Users className="w-4 h-4" />}
              title="For Everyone"
              description="Students, staff & visitors"
            />
            <div className="col-span-full bg-slate-100 p-3 rounded-md space-y-2">
              {/* Header */}
              <div className="flex items-center justify-center gap-1 text-red-500">
                <Users className="w-4 h-4" />
                <h2 className="text-sm font-semibold">Team Members</h2>
              </div>

              {/* Members */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {/* Member */}
                <div className="flex items-center gap-2 bg-white rounded-sm p-2">
                  <img
                    src="https://avatars.githubusercontent.com/u/00000000"
                    alt="Alfiya"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Alfiya
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-sm p-2">
                  <img
                    src="https://avatars.githubusercontent.com/u/00000001"
                    alt="Malavika"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Malavika
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-sm p-2">
                  <img
                    src="https://avatars.githubusercontent.com/u/00000002"
                    alt="Samjith"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Samjith
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-sm p-2">
                  <img
                    src="https://avatars.githubusercontent.com/u/00000003"
                    alt="Adith K"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Adith K
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Developed By{" "}
              <a
                href="https://marvelcustomdesigns.in/"
                target="_blank"
                className="font-medium text-muted-foreground hover:text-red-600"
              >
                Marvel Custom Designs
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-muted rounded-lg p-3 space-y-1">
    <div className="flex items-center gap-2 text-primary">
      {icon}
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

export default AboutModal;
