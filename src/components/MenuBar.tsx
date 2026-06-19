import { useTheme, THEMES, type ThemeId } from "../hooks/useTheme";

export function MenuBar() {
  const [theme, setTheme] = useTheme();
  return (
    <div className="menu-bar">
      <a href="#">File</a>
      <a href="#">Edit</a>
      <a href="#">View</a>
      <a href="#">Help</a>
      <label className="theme-switcher">
        Theme:
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeId)}
          aria-label="Theme"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
