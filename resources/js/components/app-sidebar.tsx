import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    ClipboardList,
    Database,
    FileText,
    FolderGit2,
    LayoutGrid,
    Library,
    Settings,
    Upload,
    Users,
    Sun,
    Moon,
    Shield,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { useRole } from '@/hooks/use-role';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repositorio',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentación',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { isAdmin, isCoordinator, isTeacher } =
        useRole();

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (isAdmin || isCoordinator) {
        navItems.push(
            {
                title: 'Cargar NRC',
                href: '/nrcs/create',
                icon: Upload,
            },
            {
                title: 'Gestión de NRCs',
                href: '/nrcs',
                icon: ClipboardList,
            },
            {
                title: 'Banco de preguntas',
                href: '/question-bank',
                icon: Library,
            },
            {
                title: 'Reportes',
                href: '/reports',
                icon: BarChart3,
            },
        );
    }

    if (isTeacher) {
        navItems.push({
            title: 'Reportes',
            href: '/reports',
            icon: FileText,
        });
    }

    if (isAdmin) {
        navItems.push(
            {
                title: 'Usuarios',
                href: '/users',
                icon: Users,
            },
            {
                title: 'Roles y Permisos',
                href: '/roles',
                icon: Shield,
            },
            {
                title: 'Catálogos',
                href: '/catalogs',
                icon: Database,
            },
            {
                title: 'Configuración',
                href: '/settings/profile',
                icon: Settings,
            },
        );
    }

    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleAppearance = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    // Para evitar errores de hidratación, forzamos que el primer render del cliente 
    // asuma el mismo estado que el servidor (modo claro por defecto)
    const isDark = mounted ? resolvedAppearance === 'dark' : false;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={toggleAppearance}
                            tooltip={isDark ? 'Modo claro' : 'Modo oscuro'}
                        >
                            {isDark ? <Sun /> : <Moon />}
                            <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
