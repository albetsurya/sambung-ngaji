import type { CSSProperties, ComponentType } from "react";
import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faTriangleExclamation,
  faClipboardList,
  faArrowsRotate,
  faSpinner,
  faChevronRight,
  faHouse,
  faUsers,
  faCalendarCheck,
  faBullhorn,
  faEllipsis,
  faEllipsisVertical,
  faChevronLeft,
  faPlus,
  faSun,
  faMoon,
  faWandMagicSparkles,
  faCopy,
  faShareNodes,
  faCalendar,
  faPaperPlane,
  faUser,
  faBolt,
  faChevronDown,
  faUserPlus,
  faKey,
  faTemperatureHalf,
  faCircleExclamation,
  faArrowTrendUp,
  faPen,
  faGraduationCap,
  faHeart,
  faBuilding,
  faGear,
  faScroll,
  faRightFromBracket,
  faMagnifyingGlass,
  faSliders,
  faCamera,
  faLocationDot,
  faBriefcase,
  faArrowRight,
  faEye,
  faEyeSlash,
  faFileCircleExclamation,
  faCircleCheck,
  faArrowUpRightFromSquare,
  faLock,
  faLockOpen,
  faTrash,
  faInfoCircle,
  faCircleQuestion,
  faShieldHalved,
  faLandmark,
  faQrcode,
  faDownload,
  faPalette,
  faTableCells,
  faList,
  faStar,
  faBookmark,
  faPlay,
  faPause,
  faBackwardStep,
  faForwardStep,
  faVolumeHigh,
  faAlignLeft,
  faFont,
  faBookOpen,
  faCompass,
  faLocationArrow,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

export type IconProps = Omit<FontAwesomeIconProps, "icon" | "size"> & {
  size?: number | FontAwesomeIconProps["size"];
  strokeWidth?: number;
};

export type LucideIcon = ComponentType<IconProps>;

function createIcon(icon: FontAwesomeIconProps["icon"]) {
  return function Icon({
    size,
    style,
    strokeWidth: _strokeWidth,
    ...props
  }: IconProps) {
    const iconStyle: CSSProperties = {
      ...(typeof size === "number"
        ? { width: `${size}px`, height: `${size}px` }
        : {}),
      ...style,
    };

    return (
      <FontAwesomeIcon
        icon={icon}
        {...props}
        {...(typeof size === "number" ? {} : { size })}
        style={iconStyle}
      />
    );
  };
}

export const Check = createIcon(faCheck);
export const X = createIcon(faXmark);
export const AlertTriangle = createIcon(faTriangleExclamation);
export const ClipboardList = createIcon(faClipboardList);
export const RefreshCw = createIcon(faArrowsRotate);
export const Loader2 = createIcon(faSpinner);
export const ChevronRight = createIcon(faChevronRight);
export const Home = createIcon(faHouse);
export const Users = createIcon(faUsers);
export const CalendarCheck = createIcon(faCalendarCheck);
export const Megaphone = createIcon(faBullhorn);
export const MoreHorizontal = createIcon(faEllipsis);
export const MoreVertical = createIcon(faEllipsisVertical);
export const ChevronLeft = createIcon(faChevronLeft);
export const Plus = createIcon(faPlus);
export const Sun = createIcon(faSun);
export const Moon = createIcon(faMoon);
export const Sparkles = createIcon(faWandMagicSparkles);
export const Copy = createIcon(faCopy);
export const Share2 = createIcon(faShareNodes);
export const Calendar = createIcon(faCalendar);
export const Send = createIcon(faPaperPlane);
export const User = createIcon(faUser);
export const Zap = createIcon(faBolt);
export const ChevronDown = createIcon(faChevronDown);
export const UserPlus = createIcon(faUserPlus);
export const KeyRound = createIcon(faKey);
export const Thermometer = createIcon(faTemperatureHalf);
export const CircleAlert = createIcon(faCircleExclamation);
export const TrendingUp = createIcon(faArrowTrendUp);
export const Pencil = createIcon(faPen);
export const GraduationCap = createIcon(faGraduationCap);
export const Heart = createIcon(faHeart);
export const Building2 = createIcon(faBuilding);
export const Settings = createIcon(faGear);
export const ScrollText = createIcon(faScroll);
export const LogOut = createIcon(faRightFromBracket);
export const Search = createIcon(faMagnifyingGlass);
export const SlidersHorizontal = createIcon(faSliders);
export const Camera = createIcon(faCamera);
export const MapPin = createIcon(faLocationDot);
export const Briefcase = createIcon(faBriefcase);
export const ArrowRight = createIcon(faArrowRight);
export const Eye = createIcon(faEye);
export const EyeOff = createIcon(faEyeSlash);
export const FileWarning = createIcon(faFileCircleExclamation);
export const CheckCircle2 = createIcon(faCircleCheck);
export const ArrowUpRight = createIcon(faArrowUpRightFromSquare);
export const Lock = createIcon(faLock);
export const LockOpen = createIcon(faLockOpen);
export const Info = createIcon(faInfoCircle);
export const HelpCircle = createIcon(faCircleQuestion);
export const Shield = createIcon(faShieldHalved);
export const Landmark = createIcon(faLandmark);
export const Trash2 = createIcon(faTrash);
export const QrCode = createIcon(faQrcode);
export const Download = createIcon(faDownload);
export const Palette = createIcon(faPalette);
export const LayoutGrid = createIcon(faTableCells);
export const List = createIcon(faList);

export const Star = createIcon(faStar);

export const Bookmark = createIcon(faBookmark);

export const Play = createIcon(faPlay);

export const Pause = createIcon(faPause);

export const SkipBack = createIcon(faBackwardStep);

export const SkipForward = createIcon(faForwardStep);

export const Volume2 = createIcon(faVolumeHigh);

export const AlignLeft = createIcon(faAlignLeft);

export const Type = createIcon(faFont);

export const BookOpen = createIcon(faBookOpen);

export const Compass = createIcon(faCompass);

export const Navigation = createIcon(faLocationArrow);

export const Upload = createIcon(faUpload);
