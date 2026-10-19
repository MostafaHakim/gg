import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Users,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  UserRound,
  ClipboardList,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
} from "lucide-react";
import api from "./services/api";
import { setCredentials, logout } from "./features/auth/authSlice";
import Logo from "./asset/logo.png";
const cx = (...v) => v.filter(Boolean).join(" ");

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-teal-700 text-white hover:bg-teal-800"
          : variant === "danger"
            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}
function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
      />
    </label>
  );
}
function SelectField({ label, children, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select
        {...props}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
      >
        {children}
      </select>
    </label>
  );
}
function Status({ value }) {
  const v = (value || "not applied").toLowerCase();
  const cls =
    v === "approved" || v === "active"
      ? "bg-emerald-50 text-emerald-700"
      : v === "rejected" || v === "inactive"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${cls}`}
    >
      {v}
    </span>
  );
}
function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@example.com"),
    [password, setPassword] = useState("Admin@12345"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      onLogin(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not connect to the server. Check that the backend is running.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-800 to-slate-900 p-10 text-white md:flex">
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-white p-3">
              <img src={Logo} alt="" />
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[.2em] text-teal-200 text-center">
              Employee management
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="rounded-xl bg-teal-700 p-2 text-white">
              <Building2 />
            </div>
            <span className="text-lg font-bold">PeopleDesk</span>
          </div>
          <p className="text-sm font-semibold text-teal-700">WELCOME BACK</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use your admin or in-charge account.
          </p>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <Field
              label="Email address"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"} <span>→</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
function App() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState("overview");
  const [sections, setSections] = useState([]),
    [employees, setEmployees] = useState([]),
    [incharges, setIncharges] = useState([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [sectionName, setSectionName] = useState(""),
    [sectionDesc, setSectionDesc] = useState("");
  const [icName, setIcName] = useState(""),
    [icEmail, setIcEmail] = useState(""),
    [icPassword, setIcPassword] = useState("");
  const [emp, setEmp] = useState({
    employeeId: "",
    name: "",
    phone: "",
    email: "",
    designation: "",
    joiningDate: "",
    section: "",
  });
  const [query, setQuery] = useState("");
  const isAdmin = user?.role === "admin";
  async function refresh() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const requests = [api.get("/sections"), api.get("/employees")];
      if (isAdmin) requests.push(api.get("/users/incharges"));
      const results = await Promise.all(requests);
      setSections(results[0].data.sections);
      setEmployees(results[1].data.employees);
      if (isAdmin) setIncharges(results[2].data.users);
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not load data. Is the API running?",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [user?.id]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  const visibleEmployees = useMemo(
    () =>
      employees.filter((e) =>
        [e.name, e.employeeId, e.designation, e.section?.name]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [employees, query],
  );
  async function action(fn, success) {
    setError("");
    try {
      await fn();
      setNotice(success);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed.");
    }
  }
  async function createSection(e) {
    e.preventDefault();
    await action(
      () =>
        api.post("/sections", { name: sectionName, description: sectionDesc }),
      "Section created successfully.",
    );
    setSectionName("");
    setSectionDesc("");
  }
  async function createIncharge(e) {
    e.preventDefault();
    await action(
      () =>
        api.post("/users/incharges", {
          name: icName,
          email: icEmail,
          password: icPassword,
        }),
      "In-charge account created.",
    );
    setIcName("");
    setIcEmail("");
    setIcPassword("");
  }
  async function createEmployee(e) {
    e.preventDefault();
    await action(
      () => api.post("/employees", emp),
      "Employee added successfully.",
    );
    setEmp({
      employeeId: "",
      name: "",
      phone: "",
      email: "",
      designation: "",
      joiningDate: "",
      section: "",
    });
  }
  async function review(sectionId, appId, status) {
    await action(
      () =>
        api.patch(`/sections/${sectionId}/applications/${appId}`, { status }),
      `Application ${status}.`,
    );
  }
  if (!user)
    return <Login onLogin={(data) => dispatch(setCredentials(data))} />;
  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "sections", label: "Sections", icon: Building2 },
    { id: "employees", label: "Employees", icon: Users },
    ...(isAdmin
      ? [{ id: "incharges", label: "In-charges", icon: UserRound }]
      : []),
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="rounded-xl bg-teal-700 p-2.5 text-white">
            <Building2 size={21} />
          </div>
          <div>
            <p className="font-bold tracking-tight">Gazaria Group</p>
            <p className="text-xs text-slate-500">Employee management</p>
          </div>
        </div>
        <div className="px-4 py-6">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">
            Workspace
          </p>
          <nav className="space-y-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition",
                  tab === n.id
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                )}
              >
                <n.icon size={18} />
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
              {user.name?.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs capitalize text-slate-500">{user.role}</p>
            </div>
            <button
              title="Log out"
              onClick={() => dispatch(logout())}
              className="text-slate-400 hover:text-rose-600"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-[5] flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Workspace / {tab}
            </p>
            <h1 className="mt-1 text-xl font-bold capitalize tracking-tight text-slate-900">
              {tab === "overview" ? "Dashboard" : tab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold capitalize text-teal-800 sm:inline-flex">
              <ShieldCheck size={14} className="mr-1.5" />
              {user.role} access
            </span>
            <button
              onClick={refresh}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700 lg:hidden"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          {error && (
            <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              <span>{error}</span>
              <button onClick={() => setError("")}>×</button>
            </div>
          )}
          {notice && (
            <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              {notice}
            </div>
          )}
          {tab === "overview" && (
            <>
              <div className="mb-7 rounded-3xl bg-gradient-to-r from-teal-800 to-slate-900 p-6 text-white sm:p-8">
                <p className="text-sm font-medium text-teal-200">
                  YOUR WORKSPACE
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Hello, {user.name}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">
                  {isAdmin
                    ? "Manage sections, create in-charge accounts, and approve section access applications."
                    : "Apply for access to your assigned section. Once the admin approves your request, you can add employee records."}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Stat
                  icon={Building2}
                  label="Total sections"
                  value={sections.length}
                  hint="Configured work areas"
                />
                <Stat
                  icon={Users}
                  label="Employees"
                  value={employees.length}
                  hint={
                    isAdmin ? "Across all sections" : "Added by your account"
                  }
                />
                {isAdmin ? (
                  <Stat
                    icon={UserRound}
                    label="In-charge accounts"
                    value={incharges.length}
                    hint="Section supervisors"
                  />
                ) : (
                  <Stat
                    icon={CheckCircle2}
                    label="Approved sections"
                    value={
                      sections.filter((s) => s.myApplication === "approved")
                        .length
                    }
                    hint="Ready for employee entry"
                  />
                )}
              </div>
              <div className="mt-7 grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold">Sections</h3>
                    <button
                      onClick={() => setTab("sections")}
                      className="text-sm font-semibold text-teal-700"
                    >
                      View all →
                    </button>
                  </div>
                  {sections.length ? (
                    sections.slice(0, 5).map((s) => (
                      <div
                        key={s._id}
                        className="flex items-center justify-between border-t border-slate-100 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {s.description || "No description"}
                          </p>
                        </div>
                        {isAdmin ? (
                          <span className="text-xs text-slate-500">
                            {s.applications?.filter(
                              (a) => a.status === "pending",
                            ).length || 0}{" "}
                            pending
                          </span>
                        ) : (
                          <Status value={s.myApplication || "not applied"} />
                        )}
                      </div>
                    ))
                  ) : (
                    <Empty text="No sections have been created yet." />
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold">Recent employees</h3>
                    <button
                      onClick={() => setTab("employees")}
                      className="text-sm font-semibold text-teal-700"
                    >
                      View all →
                    </button>
                  </div>
                  {employees.length ? (
                    employees.slice(0, 5).map((e) => (
                      <div
                        key={e._id}
                        className="flex items-center gap-3 border-t border-slate-100 py-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                          {e.name?.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {e.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {e.employeeId} · {e.designation}
                          </p>
                        </div>
                        <Status value={e.status} />
                      </div>
                    ))
                  ) : (
                    <Empty text="No employee records yet." />
                  )}
                </div>
              </div>
            </>
          )}
          {tab === "sections" && (
            <div className="grid items-start gap-5 xl:grid-cols-[.8fr_1.2fr]">
              {isAdmin && (
                <form
                  onSubmit={createSection}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <h2 className="mb-1 text-lg font-bold">Create a section</h2>
                  <p className="mb-5 text-sm text-slate-500">
                    Add a department or factory section.
                  </p>
                  <div className="space-y-4">
                    <Field
                      label="Section name"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      placeholder="e.g. Dyeing"
                      required
                    />
                    <label className="block text-sm font-medium text-slate-700">
                      Description
                      <textarea
                        value={sectionDesc}
                        onChange={(e) => setSectionDesc(e.target.value)}
                        rows="3"
                        placeholder="Optional details"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal focus:border-teal-600"
                      />
                    </label>
                    <Button type="submit">
                      <Plus size={16} /> Create section
                    </Button>
                  </div>
                </form>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    {isAdmin ? "Section access requests" : "Available sections"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isAdmin
                      ? "Review in-charge applications and approve or reject access."
                      : "Apply to the section you are responsible for."}
                  </p>
                </div>
                <div className="space-y-3">
                  {sections.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{s.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {s.description || "No description provided."}
                          </p>
                        </div>
                        {!isAdmin && (
                          <div className="flex items-center gap-2">
                            {s.myApplication && (
                              <Status value={s.myApplication} />
                            )}
                            <Button
                              variant="secondary"
                              disabled={
                                s.myApplication === "approved" ||
                                s.myApplication === "pending"
                              }
                              onClick={() =>
                                action(
                                  () => api.post(`/sections/${s._id}/apply`),
                                  "Section application submitted.",
                                )
                              }
                            >
                              {s.myApplication === "rejected"
                                ? "Apply again"
                                : s.myApplication === "approved"
                                  ? "Approved"
                                  : s.myApplication === "pending"
                                    ? "Pending"
                                    : "Apply for access"}
                            </Button>
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          {s.applications?.length ? (
                            s.applications.map((a) => (
                              <div
                                key={a._id}
                                className="flex flex-wrap items-center justify-between gap-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-semibold">
                                    {a.user?.name || "Unknown user"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {a.user?.email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Status value={a.status} />
                                  {a.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          review(s._id, a._id, "approved")
                                        }
                                        title="Approve"
                                        className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                                      >
                                        <CheckCircle2 size={17} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          review(s._id, a._id, "rejected")
                                        }
                                        title="Reject"
                                        className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                                      >
                                        <XCircle size={17} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400">
                              No applications yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {!sections.length && (
                    <Empty text="No sections yet. Create one to get started." />
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === "employees" && (
            <div className="space-y-5">
              {!isAdmin && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="mb-1 text-lg font-bold">Add employee</h2>
                  <p className="mb-5 text-sm text-slate-500">
                    Only sections approved by the admin can be selected.
                  </p>
                  {sections.some((s) => s.myApplication === "approved") ? (
                    <form
                      onSubmit={createEmployee}
                      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      <Field
                        label="Employee ID"
                        value={emp.employeeId}
                        onChange={(e) =>
                          setEmp({ ...emp, employeeId: e.target.value })
                        }
                        placeholder="EMP-001"
                        required
                      />
                      <Field
                        label="Full name"
                        value={emp.name}
                        onChange={(e) =>
                          setEmp({ ...emp, name: e.target.value })
                        }
                        placeholder="Employee name"
                        required
                      />
                      <Field
                        label="Designation"
                        value={emp.designation}
                        onChange={(e) =>
                          setEmp({ ...emp, designation: e.target.value })
                        }
                        placeholder="e.g. Operator"
                        required
                      />
                      <Field
                        label="Phone"
                        value={emp.phone}
                        onChange={(e) =>
                          setEmp({ ...emp, phone: e.target.value })
                        }
                        placeholder="01XXXXXXXXX"
                      />
                      <Field
                        label="Email"
                        type="email"
                        value={emp.email}
                        onChange={(e) =>
                          setEmp({ ...emp, email: e.target.value })
                        }
                        placeholder="employee@example.com"
                      />
                      <Field
                        label="Joining date"
                        type="date"
                        value={emp.joiningDate}
                        onChange={(e) =>
                          setEmp({ ...emp, joiningDate: e.target.value })
                        }
                      />
                      <SelectField
                        label="Approved section"
                        value={emp.section}
                        onChange={(e) =>
                          setEmp({ ...emp, section: e.target.value })
                        }
                        required
                      >
                        <option value="">Select section</option>
                        {sections
                          .filter((s) => s.myApplication === "approved")
                          .map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                      </SelectField>
                      <div className="flex items-end">
                        <Button type="submit">
                          <Plus size={16} /> Add employee
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      You do not have an approved section yet. Go to{" "}
                      <button
                        onClick={() => setTab("sections")}
                        className="font-bold underline"
                      >
                        Sections
                      </button>
                      , apply for access, and wait for the admin to approve it.
                    </div>
                  )}
                </div>
              )}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-bold">Employee directory</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {visibleEmployees.length} record(s)
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search employees…"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        {[
                          "Employee",
                          "Employee ID",
                          "Designation",
                          "Section",
                          "Phone",
                          "Status",
                        ].map((h) => (
                          <th key={h} className="px-5 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleEmployees.map((e) => (
                        <tr key={e._id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">
                              {e.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {e.email || "No email"}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {e.employeeId}
                          </td>
                          <td className="px-5 py-4">{e.designation}</td>
                          <td className="px-5 py-4">
                            {e.section?.name || "—"}
                          </td>
                          <td className="px-5 py-4">{e.phone || "—"}</td>
                          <td className="px-5 py-4">
                            <Status value={e.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!visibleEmployees.length && (
                    <Empty text="No employees match your search." />
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === "incharges" && isAdmin && (
            <div className="grid items-start gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <form
                onSubmit={createIncharge}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <h2 className="text-lg font-bold">Create in-charge account</h2>
                <p className="mb-5 mt-1 text-sm text-slate-500">
                  Share login details securely with the relevant supervisor.
                </p>
                <div className="space-y-4">
                  <Field
                    label="Full name"
                    value={icName}
                    onChange={(e) => setIcName(e.target.value)}
                    placeholder="In-charge name"
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={icEmail}
                    onChange={(e) => setIcEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                  <Field
                    label="Temporary password"
                    type="password"
                    minLength="8"
                    value={icPassword}
                    onChange={(e) => setIcPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                  <Button type="submit">
                    <Plus size={16} /> Create account
                  </Button>
                </div>
              </form>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-bold">In-charge accounts</h2>
                <div className="divide-y divide-slate-100">
                  {incharges.map((u) => (
                    <div key={u._id} className="flex items-center gap-3 py-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                        <UserRound size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </div>
                      <Status value={u.active ? "active" : "inactive"} />
                    </div>
                  ))}
                  {!incharges.length && (
                    <Empty text="No in-charge accounts created yet." />
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
            <span>PeopleDesk · Employee Management MVP</span>
            <span className="flex items-center gap-1">
              <BriefcaseBusiness size={13} /> Role-based access enabled
            </span>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-3 border-t border-slate-200 bg-white p-2 lg:hidden">
        {nav.slice(0, 3).map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={cx(
              "flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-semibold",
              tab === n.id ? "text-teal-800" : "text-slate-500",
            )}
          >
            <n.icon size={18} />
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3 text-teal-800">
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
function Empty({ text }) {
  return (
    <div className="py-9 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <ClipboardList size={21} />
      </div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
export default App;
