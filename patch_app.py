import re

with open('/home/malayneum/Documents/FFmotor/apps/web/src/App.tsx', 'r') as f:
    content = f.read()

helper = """
const isTabAllowed = (role: string, tab: string) => {
  if (role === "owner") return true;
  if (["dashboard", "customer-portal", "track", "passport", "katalog"].includes(tab)) return true;
  const roleTabs: Record<string, string[]> = {
    kerani_1: ["work-orders", "express-intake", "pos-checkout", "customers", "quotations", "inventory", "finance", "inbox", "settings"],
    kerani_2: ["inventory", "suppliers", "ecommerce-orders", "inbox"],
    foreman: ["pit-live", "work-orders", "warranty-issues", "authenticity", "inbox"],
    affiliate: ["motor-sales", "loan-pipeline", "leads", "bike-locks", "affiliate", "customers"]
  };
  # Allow staff/staff-performance only for owner
  if (tab === "staff" || tab === "staff-performance") return false;
  return roleTabs[role]?.includes(tab) ?? false;
};

const Unauthorized = () => (
  <div className="flex items-center justify-center h-64"><div className="text-center"><div className="text-red-500 text-4xl mb-3">🚫</div><p className="text-zinc-900 font-bold">Akses Tidak Dibenarkan</p><p className="text-zinc-500 text-sm">Peranan anda tidak mempunyai akses ke modul ini.</p></div></div>
);

"""

# Inject helper before export const App
content = content.replace("export const App: React.FC = () => {", helper + "export const App: React.FC = () => {")

# We want to wrap the inside of <main ...> with {!isTabAllowed(currentUser.role, activeTab) ? <Unauthorized /> : <> ... </>}
main_start = content.find('<main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">')
main_start += len('<main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">')

main_end = content.find('</main>')

before_main = content[:main_start]
inside_main = content[main_start:main_end]
after_main = content[main_end:]

wrapped_main = f"""
          {{!isTabAllowed(currentUser.role, activeTab) ? (
            <Unauthorized />
          ) : (
            <>{inside_main}</>
          )}}"""

new_content = before_main + wrapped_main + after_main

with open('/home/malayneum/Documents/FFmotor/apps/web/src/App.tsx', 'w') as f:
    f.write(new_content)

