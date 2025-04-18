import { BriefcaseBusinessIcon, Calendar, Code2Icon, ComputerIcon, GroupIcon, LayoutDashboard, List, Puzzle, Settings, User, User2Icon, Users, WalletCards } from "lucide-react";

export const SideBarOptions = [
    {
        name:'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
    },
    {
        name:'Scheduled Interview',
        icon: Calendar,
        path: '/scheduled-interview',
    },
    {
        name:'All Interview',
        icon: List,
        path: '/all-interview',
    },
    {
        name:'Billing',
        icon: WalletCards,
        path: '/billing',
    },
    {
        name:'Settings',
        icon: Settings,
        path: '/settings',
    },
]

export const InterviewType = [
    {
        title: 'Technical',
        icon: Code2Icon
    },
    {
        title: 'Behavioral',
        icon: User2Icon
    },
    {
        title: 'Experience',
        icon: BriefcaseBusinessIcon
    },
    {
        title: 'Problem-Solving',
        icon: Puzzle
    },
    {
        title: 'System Design',
        icon: ComputerIcon
    },
    {
        title: 'Leadership',
        icon: Users
    },
]
