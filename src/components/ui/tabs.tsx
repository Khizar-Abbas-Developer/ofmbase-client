import * as React from "react";

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  tabChangeFunction?: (value: string) => void; // ✅ add this
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
}>({ value: "", setValue: () => {} });

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={`flex gap-2 border-b border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  tabChangeFunction,
}: TabsTriggerProps) {
  const { value: selectedValue, setValue } = React.useContext(TabsContext);
  const isSelected = value === selectedValue;

  return (
    <button
      onClick={() => {
        setValue(value);
        tabChangeFunction();
      }}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        isSelected
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext);

  if (value !== selectedValue) return null;

  return <div>{children}</div>;
}
