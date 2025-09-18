
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { useTheme, ACCENT_COLORS, BACKGROUND_COLORS } from '@/context/AccentColorContext';
import { useSnowflakes } from '@/context/SnowflakesContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  PaintBrush,
  Moon,
  Sun,
  Snowflake,
  Palette
} from '@phosphor-icons/react';

function Settings() {
  const { showSnowflakes, setShowSnowflakes, snowflakeIntensity, setSnowflakeIntensity } = useSnowflakes();
  const { 
    accentColor, 
    setAccentColor, 
    backgroundColor, 
    setBackgroundColor, 
    isDarkMode, 
    toggleThemeMode 
  } = useTheme();
  
  const [colorChanged, setColorChanged] = useState(false);
  const [bgChanged, setBgChanged] = useState(false);

  // Handle color change with feedback
  const handleColorChange = (color: string) => {
    setAccentColor(color);
    setColorChanged(true);
    setTimeout(() => setColorChanged(false), 1200);
  };
  
  // Handle background color change with feedback
  const handleBgChange = (color: string) => {
    setBackgroundColor(color);
    setBgChanged(true);
    setTimeout(() => setBgChanged(false), 1200);
  };

  // Filter background colors based on current theme mode
  const filteredBackgroundColors = Object.entries(BACKGROUND_COLORS).filter(([key]) => {
    const isDarkColor = ['dark', 'darker', 'navy', 'gray', 'charcoal', 'black'].includes(key);
    return isDarkMode ? isDarkColor : !isDarkColor;
  });

  return (
    <DashboardLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-2xl font-mono font-bold">App Settings</h1>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isDarkMode ? (
                    <Moon size={20} className="mr-2 text-primary" />
                  ) : (
                    <Sun size={20} className="mr-2 text-primary" />
                  )}
                  <span>Theme Mode</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2 text-xs text-text-secondary">
                    {isDarkMode ? 'Dark' : 'Light'}
                  </span>
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!isDarkMode}
                    onChange={toggleThemeMode}
                  />
                  <div className={`relative w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all accent-transition ${isDarkMode ? 'bg-gray-700 after:border-gray-700' : 'bg-gray-300 after:border-gray-300'} peer-checked:bg-primary`}></div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PaintBrush size={20} className="mr-2 text-primary" />
                  <span>Accent Color</span>
                </div>
                {colorChanged && (
                  <span className="text-xs text-primary animate-fade-in">
                    Color updated!
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.entries(ACCENT_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-full transition-all accent-transition relative flex items-center justify-center ${
                      accentColor === color 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set accent color to ${name}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Palette size={20} className="mr-2 text-primary" />
                  <span>Background Color</span>
                </div>
                {bgChanged && (
                  <span className="text-xs text-primary animate-fade-in">
                    Background updated!
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {filteredBackgroundColors.map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => handleBgChange(color)}
                    className={`w-8 h-8 rounded-full transition-all accent-transition relative flex items-center justify-center ${
                      backgroundColor === color 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set background color to ${name}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Snowflake size={20} className="mr-2 text-primary" />
                  <span>Snowflakes Effect</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={showSnowflakes}
                    onChange={() => setShowSnowflakes(!showSnowflakes)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

export default Settings;
