import {
  createIcons,
  createElement,
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Backpack,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Cpu,
  CreditCard,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flame,
  Footprints,
  Glasses,
  Globe,
  Headphones,
  Headset,
  Heart,
  HelpCircle,
  House,
  Image,
  Info,
  LampDesk,
  Laptop,
  Layers,
  LayoutGrid,
  Lightbulb,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Minus,
  Navigation,
  Package,
  Percent,
  Plus,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  SearchX,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Speaker,
  Star,
  Store,
  Sun,
  Moon,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  UploadCloud,
  User,
  Users,
  Video,
  Play,
  Radio,
  Music,
  Share2,
  Bookmark,
  Key,
  Terminal,
  Copy,
  CheckCheck,
  Wand2,
  Watch,
  X,
  Zap,
} from 'lucide';

/** Only the icons we actually use are bundled (tree-shaken). */
const icons = {
  Activity, AlertCircle, ArrowRight, ArrowUpRight, Backpack, BarChart3, Bell, Bookmark, Bot, Briefcase, Camera, Check, CheckCheck,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Coffee, Compass, Copy, Cpu, CreditCard, DollarSign, Edit, ExternalLink, Eye,
  FileText, Filter, Flame, Footprints, Glasses, Globe, Headphones, Headset, Heart, HelpCircle, House, Image, Info,
  Key, LampDesk, Laptop, Layers, LayoutGrid, Lightbulb, Lock, LogOut, MapPin, MessageSquare, Minus, Moon, Music, Navigation, Package, Percent, Play, Plus, PlusCircle,
  Radio, RefreshCw, RotateCcw, ScanLine, Search, SearchX, Send, Settings, Share2, ShieldCheck, ShoppingBag, ShoppingCart,
  Sliders, SlidersHorizontal, Smartphone, Sparkles, Speaker, Star, Store, Sun, Tag, Terminal, Trash2, TrendingUp, Truck,
  UploadCloud, User, Users, Video, Wand2, Watch, X, Zap,
};

const toPascalCase = (name) => name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());

/** Replace every static `<i data-lucide="…">` in the page with its SVG. */
export function renderStaticIcons() {
  createIcons({ icons });
}

/**
 * Return SVG markup for an icon, for use inside template strings.
 * @param {string} name   kebab-case Lucide name, e.g. "shopping-cart"
 * @param {string} cls    extra classes
 * @param {object} attrs  extra SVG attributes, e.g. { 'stroke-width': 1.5 }
 */
export function icon(name, cls = '', attrs = {}) {
  const node = icons[toPascalCase(name)];
  if (!node) return '';
  const svg = createElement(node);
  svg.setAttribute('class', `lucide lucide-${name} ${cls}`.trim());
  svg.setAttribute('aria-hidden', 'true');
  Object.entries(attrs).forEach(([key, value]) => svg.setAttribute(key, value));
  return svg.outerHTML;
}
