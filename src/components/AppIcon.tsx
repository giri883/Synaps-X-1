import React from 'react';
import {
  GraduationCap,
  HardDrive,
  FileText,
  Video,
  Users,
  Cloud,
  BookOpen,
  Compass,
  Code,
  Terminal,
  GitBranch,
  Mail,
  MessageCircle,
  Send,
  Headphones,
  Tv,
  Briefcase,
  Twitter,
  Camera,
  Globe,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ShoppingBag,
  ShieldCheck,
  Play,
  Music,
  Calendar,
  CheckSquare,
  Layout,
  Columns,
  Palette,
  PenTool,
  Sparkles,
  Cpu,
  Bot,
  Brain,
  School,
  PlayCircle,
  Zap,
  MessageSquare,
  Share2,
} from 'lucide-react';

interface AppIconProps {
  name: string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'School':
      return <School className={className} />;
    case 'HardDrive':
      return <HardDrive className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Video':
      return <Video className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Code':
      return <Code className={className} />;
    case 'Terminal':
      return <Terminal className={className} />;
    case 'GitBranch':
      return <GitBranch className={className} />;
    case 'Mail':
      return <Mail className={className} />;
    case 'MessageCircle':
      return <MessageCircle className={className} />;
    case 'Send':
      return <Send className={className} />;
    case 'Headphones':
      return <Headphones className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Twitter':
      return <Twitter className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Smartphone':
      return <Smartphone className={className} />;
    case 'ArrowUpRight':
      return <ArrowUpRight className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Play':
      return <Play className={className} />;
    case 'PlayCircle':
      return <PlayCircle className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'CheckSquare':
      return <CheckSquare className={className} />;
    case 'Layout':
      return <Layout className={className} />;
    case 'Columns':
      return <Columns className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Bot':
      return <Bot className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'MessageSquare':
      return <MessageSquare className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    default:
      return <GraduationCap className={className} />;
  }
};
