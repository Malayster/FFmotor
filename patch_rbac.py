import re

with open('/home/malayneum/Documents/FFmotor/apps/web/src/App.tsx', 'r') as f:
    content = f.read()

# Insert the helper functions
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
  return roleTabs[role]?.includes(tab) ?? false;
};

const Unauthorized = () => (
  <div className="flex items-center justify-center h-64"><div className="text-center"><div className="text-red-500 text-4xl mb-3">🚫</div><p className="text-zinc-900 font-bold">Akses Tidak Dibenarkan</p><p className="text-zinc-500 text-sm">Peranan anda tidak mempunyai akses ke modul ini.</p></div></div>
);

"""

# find export const App: React.FC = () => {
content = content.replace("export const App: React.FC = () => {", helper + "export const App: React.FC = () => {")

# find each {activeTab === "xxx" && ( ... )} or {activeTab === "xxx" && <... />}
# and wrap it in {activeTab === "xxx" && (isTabAllowed(currentUser.role, "xxx") ? ... : <Unauthorized />)}
# But wait, dashboard is already handled with specific roles like {activeTab === "dashboard" && currentUser.role === "owner" && <OwnerDashboard />} - leave those alone, they are inherently protected.
# We just need to replace the tabs listed in the requirement.

# Regex to find: {activeTab === "something" && ( ... )} or {activeTab === "something" && <Something />}
def replacer(match):
    full = match.group(0)
    tab = match.group(1)
    rest = match.group(2)
    # Skip dashboard
    if tab == 'dashboard':
        return full
    # Skip public ones (track, passport, katalog, customer-portal) just in case, but they are allowed by isTabAllowed.
    # It's safer to just wrap them.
    if tab in ['customer-portal', 'track', 'passport', 'katalog']:
        return full
    
    # Wait, some components are wrapped in parens, some are not.
    # Let's wrap `rest` in `(isTabAllowed(currentUser.role, "{tab}") ? {rest} : <Unauthorized />)`
    return f'{{activeTab === "{tab}" && (isTabAllowed(currentUser.role, "{tab}") ? {rest} : <Unauthorized />)}}'

# regex matches {activeTab === "tab" && something}
# where something can be <Comp /> or ( <Comp /> )
pattern = re.compile(r'\{activeTab\s*===\s*"([^"]+)"\s*&&\s*([\s\S]*?(?=\}\s*(?:\{|</main>|/\*)))\}')

# wait, regex parsing jsx is hard. Let's do it semi-manually by identifying the blocks.

# Let's split content into before <main>, inside <main>, after </main>
main_start = content.find('<main')
main_end = content.find('</main>')

main_content = content[main_start:main_end]
# replace {activeTab === "xxx" && 
# let's write a targeted replace.
tabs_to_protect = [
    "work-orders", "express-intake", "pos-checkout", "customers", "quotations",
    "pit-live", "warranty-issues", "authenticity", "inventory", "suppliers",
    "ecommerce-orders", "motor-sales", "loan-pipeline", "leads", "bike-locks",
    "affiliate", "finance", "inbox", "campaigns", "settings"
]

for tab in tabs_to_protect:
    # find {activeTab === "tab" && (
    if f'{{activeTab === "{tab}" && (' in main_content:
        # replace just the start
        # but where does it end? it ends with )} 
        # Actually it's easier to replace `{activeTab === "tab" && (` with `{activeTab === "tab" && (isTabAllowed(currentUser.role, "tab") ? (`
        # and then the matching `)}` needs a ` : <Unauthorized />)}`
        pass # Too complex for simple string replace without counting brackets.

