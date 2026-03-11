---
title: "Theme System - Portal S4A"
description: "Dynamic theme system with light/dark modes and customizable colors"
tags: ["themes", "ui", "css", "customization"]
---

# Theme System - Portal S4A

## Overview

Portal S4A features a dynamic theme system supporting light/dark modes with customizable colors stored in the database and applied via CSS variables.

## Architecture

### Theme Storage
- **Database:** `themes` table with light/dark configurations
- **CSS Variables:** Dynamic injection via `next-themes`
- **User Preference:** Stored in localStorage and database

### Theme Structure

```typescript
interface Theme {
  mode: 'light' | 'dark';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  button_color: string;
  button_hover_color: string;
  button_text_color: string;
}
```

## Implementation

### Database Schema

```sql
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  mode TEXT UNIQUE NOT NULL CHECK (mode IN ('light', 'dark')),
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  button_color TEXT NOT NULL,
  button_hover_color TEXT NOT NULL,
  button_text_color TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### CSS Variables

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... other variables */
}
```

### Theme Provider

```typescript
// src/components/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect } from 'react';
import { useGlobalTheme } from '@/hooks/use-global-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { applyTheme } = useGlobalTheme();

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

## Usage

### Theme Hook

```typescript
// src/hooks/use-global-theme.tsx
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useGlobalTheme() {
  const { theme, setTheme } = useTheme();
  const [customTheme, setCustomTheme] = useState(null);

  const applyTheme = async () => {
    try {
      const response = await fetch('/api/themes/current');
      const themeData = await response.json();
      
      if (themeData.success) {
        applyCustomColors(themeData.theme);
        setCustomTheme(themeData.theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const applyCustomColors = (themeConfig) => {
    const root = document.documentElement;
    
    Object.entries(themeConfig).forEach(([key, value]) => {
      if (key !== 'mode' && key !== 'id') {
        const cssVar = `--${key.replace(/_/g, '-')}`;
        root.style.setProperty(cssVar, value);
      }
    });
  };

  return {
    theme,
    setTheme,
    customTheme,
    applyTheme,
    applyCustomColors
  };
}
```

### Theme Switcher Component

```typescript
// src/components/theme-switcher.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalTheme } from '@/hooks/use-global-theme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useGlobalTheme();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

## Theme Management

### Server Actions

```typescript
// src/lib/actions/theme.actions.ts
'use server';

import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateTheme(mode: 'light' | 'dark', colors: ThemeColors) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Permission denied' };
  }

  try {
    await db`
      UPDATE themes 
      SET 
        primary_color = ${colors.primary_color},
        secondary_color = ${colors.secondary_color},
        accent_color = ${colors.accent_color},
        background_color = ${colors.background_color},
        button_color = ${colors.button_color},
        button_hover_color = ${colors.button_hover_color},
        button_text_color = ${colors.button_text_color},
        updated_at = NOW()
      WHERE mode = ${mode}
    `;

    revalidatePath('/settings/themes');
    return { success: true };
  } catch (error) {
    console.error('Error updating theme:', error);
    return { success: false, error: 'Failed to update theme' };
  }
}

export async function getCurrentTheme(mode: 'light' | 'dark') {
  try {
    const [theme] = await db`
      SELECT * FROM themes WHERE mode = ${mode}
    `;
    return { success: true, theme };
  } catch (error) {
    console.error('Error fetching theme:', error);
    return { success: false, error: 'Failed to fetch theme' };
  }
}
```

### API Routes

```typescript
// src/app/api/themes/current/route.ts
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' });
    }

    // Get user's preferred theme or default to light
    const mode = 'light'; // Could be from user preferences
    
    const [theme] = await db`
      SELECT * FROM themes WHERE mode = ${mode}
    `;

    if (!theme) {
      return NextResponse.json({ success: false, error: 'Theme not found' });
    }

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Error fetching current theme:', error);
    return NextResponse.json({ success: false, error: 'Internal error' });
  }
}
```

## Theme Configuration

### Settings Page

```typescript
// src/app/settings/themes/page.tsx
import { ThemeManager } from '@/components/settings/theme-manager';
import { getCurrentTheme } from '@/lib/actions/theme.actions';

export default async function ThemesPage() {
  const lightTheme = await getCurrentTheme('light');
  const darkTheme = await getCurrentTheme('dark');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme Settings</h1>
        <p className="text-muted-foreground">
          Customize the appearance of the application
        </p>
      </div>

      <ThemeManager 
        lightTheme={lightTheme.theme}
        darkTheme={darkTheme.theme}
      />
    </div>
  );
}
```

### Theme Manager Component

```typescript
// src/components/settings/theme-manager.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateTheme } from '@/lib/actions/theme.actions';
import { toast } from 'sonner';

export function ThemeManager({ lightTheme, darkTheme }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (mode: 'light' | 'dark', formData: FormData) => {
    setLoading(true);
    try {
      const colors = {
        primary_color: formData.get('primary_color') as string,
        secondary_color: formData.get('secondary_color') as string,
        accent_color: formData.get('accent_color') as string,
        background_color: formData.get('background_color') as string,
        button_color: formData.get('button_color') as string,
        button_hover_color: formData.get('button_hover_color') as string,
        button_text_color: formData.get('button_text_color') as string,
      };

      const result = await updateTheme(mode, colors);
      
      if (result.success) {
        toast.success('Theme updated successfully');
        // Trigger theme reload
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update theme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="light" className="space-y-4">
      <TabsList>
        <TabsTrigger value="light">Light Theme</TabsTrigger>
        <TabsTrigger value="dark">Dark Theme</TabsTrigger>
      </TabsList>

      <TabsContent value="light">
        <ThemeForm 
          theme={lightTheme}
          mode="light"
          onSubmit={handleSubmit}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="dark">
        <ThemeForm 
          theme={darkTheme}
          mode="dark"
          onSubmit={handleSubmit}
          loading={loading}
        />
      </TabsContent>
    </Tabs>
  );
}
```

## Best Practices

### Color Selection
- **Contrast:** Ensure sufficient contrast for accessibility
- **Consistency:** Maintain color harmony across themes
- **Brand Alignment:** Reflect company branding
- **User Testing:** Validate with actual users

### Performance
- **CSS Variables:** Use for dynamic color changes
- **Minimal Repaints:** Avoid unnecessary DOM updates
- **Caching:** Cache theme preferences
- **Lazy Loading:** Load themes on demand

### Accessibility
- **WCAG Compliance:** Meet accessibility standards
- **High Contrast:** Support high contrast modes
- **Color Blindness:** Consider color blind users
- **Keyboard Navigation:** Ensure keyboard accessibility

## Troubleshooting

### Theme Not Applying

```typescript
// Check if CSS variables are set
const root = document.documentElement;
const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color');
console.log('Primary color:', primaryColor);

// Force theme reload
window.location.reload();
```

### Database Issues

```sql
-- Check theme data
SELECT * FROM themes;

-- Reset to defaults
UPDATE themes SET 
  primary_color = '#000000',
  secondary_color = '#f5f5f5'
WHERE mode = 'light';
```

### CSS Variable Issues

```css
/* Ensure variables are properly defined */
:root {
  --primary-color: #000000;
  --secondary-color: #f5f5f5;
}

/* Check variable usage */
.element {
  background-color: var(--primary-color, #000000);
}
```

## Advanced Features

### Theme Presets
- Create predefined theme combinations
- Allow users to select from presets
- Export/import theme configurations

### Dynamic Theming
- Real-time color picker
- Live preview of changes
- Undo/redo functionality

### User Preferences
- Per-user theme settings
- Automatic theme switching
- System theme detection

### Theme Validation
- Color contrast checking
- Accessibility validation
- Brand guideline compliance