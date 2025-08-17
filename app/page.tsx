"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoginForm } from "@/components/login-form"
import { AdminPanel } from "@/components/admin-panel"
import { AuthManager } from "@/lib/auth"
import { toPersianNumbers } from "@/lib/utils"
import { AppSettingsManager } from "@/lib/app-settings"
import { EnhancedVipCalling } from "@/components/enhanced-vip-calling"
import { 
    getAllPersonnel, 
    addPersonnel, 
    updatePersonnel, 
    deletePersonnel, 
    getUniqueProjects,
    getUniqueDepartments,
    getUniquePositions,
    type PersonnelData,
    type Project,
    type Department,
    type Position,
} from "@/lib/personnel-data"

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
)

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const ClearIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const CallIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const ProjectIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);

const DepartmentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
);

const PositionIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
);


export default function PhoneDirectory() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [currentData, setCurrentData] = useState<PersonnelData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [vipPopup, setVipPopup] = useState<{ voipNumber: string; position: { x: number; y: number } } | null>(null);
  const [appSettings, setAppSettings] = useState(AppSettingsManager.getInstance().getSettings());

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [personnel, projs, depts, pos] = await Promise.all([
                getAllPersonnel(),
                getUniqueProjects(),
                getUniqueDepartments(),
                getUniquePositions(),
            ]);
            setCurrentData(personnel);
            setProjects(projs);
            setDepartments(depts);
            setPositions(pos);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const settingsManager = AppSettingsManager.getInstance()
    const updateSettings = () => {
      setAppSettings(settingsManager.getSettings())
    }
    updateSettings()
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app-settings") {
        updateSettings()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, []);

  const filteredData = useMemo(() => {
    return currentData.filter((person) => {
      const lowercasedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        person.persianName.toLowerCase().includes(lowercasedSearch) ||
        person.englishName.toLowerCase().includes(lowercasedSearch) ||
        person.personnelCode.includes(searchTerm) ||
        person.voipNumber.includes(searchTerm) ||
        person.project.toLowerCase().includes(lowercasedSearch) ||
        person.department.toLowerCase().includes(lowercasedSearch) ||
        person.position.toLowerCase().includes(lowercasedSearch)

      const matchesProject = projectFilter === "all" || person.project === projectFilter
      const matchesDepartment = departmentFilter === "all" || person.department === departmentFilter
      const matchesPosition = positionFilter === "all" || person.position === positionFilter

      return matchesSearch && matchesProject && matchesDepartment && matchesPosition
    })
  }, [currentData, searchTerm, projectFilter, departmentFilter, positionFilter]);

  const clearFilters = () => {
    setSearchTerm("")
    setProjectFilter("all")
    setDepartmentFilter("all")
    setPositionFilter("all")
  }

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    AuthManager.getInstance().logout();
    setIsAuthenticated(false);
  };

  const handleAddPersonnel = async (person: Omit<PersonnelData, 'id'>) => {
    const result = await addPersonnel(person);
    if (result.success) {
        const newPersonWithId = { ...person, id: Date.now() }; 
        setCurrentData(prevData => [...prevData, newPersonWithId]);
    }
    return result;
  };

  const handleUpdatePersonnel = async (personnelCode: string, updatedData: Partial<PersonnelData>) => {
    const result = await updatePersonnel(personnelCode, updatedData);
    if (result.success) {
        setCurrentData(prevData => {
            const index = prevData.findIndex(p => p.personnelCode === personnelCode);
            if (index === -1) return prevData;
            
            const newData = [...prevData];
            newData[index] = { ...newData[index], ...updatedData };
            return newData;
        });
    }
    return result;
  };

  const handleDeletePersonnel = async (personnelCode: string) => {
    const result = await deletePersonnel(personnelCode);
    if (result.success) {
        setCurrentData(prevData => prevData.filter(p => p.personnelCode !== personnelCode));
    }
    return result;
  };
  
  const handleVipClick = (voipNumber: string, event: React.MouseEvent) => {
    event.preventDefault()
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setVipPopup({
      voipNumber,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    })
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setVipPopup(null)
    }

    if (vipPopup) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [vipPopup])

  if (isAuthenticated) {
      return (
          <AdminPanel
              personnelData={currentData}
              onAddPersonnel={handleAddPersonnel}
              onUpdatePersonnel={handleUpdatePersonnel}
              onDeletePersonnel={handleDeletePersonnel}
              onLogout={handleLogout}
          />
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 relative">
        {showLogin && <LoginForm onLogin={handleLogin} />}

        {vipPopup && (
            <EnhancedVipCalling
            voipNumber={vipPopup.voipNumber}
            onClose={() => setVipPopup(null)}
            position={vipPopup.position}
            />
        )}
        
        {isLoading && (
            <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                <p>در حال بارگذاری اطلاعات...</p>
            </div>
        )}

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 sm:mb-12 flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="لوگوی شرکت فراپخت"
              width={205}
              height={50}
              className="h-12 w-auto mb-6"
              priority
            />
            <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-white rounded-full shadow">
                    <UsersIcon className="w-8 h-8 text-gray-600"/>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center leading-tight">
                {appSettings.appTitle.split("شرکت")[0]}<br/>شرکت {appSettings.appTitle.split("شرکت")[1]}
                </h1>
            </div>
        </header>

        <section className="mb-6 sm:mb-8 bg-white p-4 rounded-2xl shadow-lg">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <Input
              placeholder="جستجو در نام، کد پرسنلی، شماره ویپ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 sm:pr-16 pl-4 sm:pl-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-black placeholder:text-gray-500"
              dir="rtl"
              maxLength={100}
            />
          </div>

          <div className="max-w-3xl mx-auto mt-4">
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="col-span-1">
                <Select value={projectFilter} onValueChange={(value) => setProjectFilter(value)}>
                  <SelectTrigger className="w-full bg-gray-100 border-gray-200 rounded-xl h-12 relative flex items-center justify-center px-2 sm:px-4">
                    <ProjectIcon className="text-gray-500" />
                    <span className="hidden sm:inline mx-auto"><SelectValue placeholder="پروژه" /></span>
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 rounded-xl">
                    <SelectItem value="all">پروژه‌ها</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value)}>
                  <SelectTrigger className="w-full bg-gray-100 border-gray-200 rounded-xl h-12 relative flex items-center justify-center px-2 sm:px-4">
                    <DepartmentIcon className="text-gray-500" />
                    <span className="hidden sm:inline mx-auto"><SelectValue placeholder="بخش" /></span>
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 rounded-xl">
                    <SelectItem value="all">بخش‌ها</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.name}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <Select value={positionFilter} onValueChange={(value) => setPositionFilter(value)}>
                  <SelectTrigger className="w-full bg-gray-100 border-gray-200 rounded-xl h-12 relative flex items-center justify-center px-2 sm:px-4">
                    <PositionIcon className="text-gray-500" />
                    <span className="hidden sm:inline mx-auto"><SelectValue placeholder="سمت" /></span>
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 rounded-xl">
                    <SelectItem value="all">سمت‌ها</SelectItem>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.name}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                 <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full h-12 border-gray-200 bg-gray-100 rounded-xl hover:bg-red-100 hover:border-red-300 flex items-center justify-center gap-2 transition-all duration-300 text-base"
                >
                  <ClearIcon className="text-red-500 w-6 h-6"/>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-2 sm:mx-0">
            {/* Mobile View: Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredData.map((person) => (
                    <div key={person.personnelCode} className="bg-white text-slate-800 rounded-xl shadow-md p-4 space-y-3 border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{person.persianName}</h3>
                                <p className="text-sm text-gray-500">{person.englishName}</p>
                            </div>
                            <button onClick={(e) => handleVipClick(person.voipNumber, e)} className="flex items-center gap-2 bg-gray-100 text-gray-800 font-bold px-3 py-2 rounded-lg text-lg">
                                <span>{toPersianNumbers(person.voipNumber)}</span>
                                <CallIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="pt-3 border-t grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="text-gray-500">پروژه:</div>
                            <div className="font-semibold text-slate-700">{person.project}</div>
                            
                            <div className="text-gray-500">بخش:</div>
                            <div className="font-semibold text-slate-700">{person.department}</div>

                            <div className="text-gray-500">سمت:</div>
                            <div className="font-semibold text-slate-700">{person.position}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-center p-4 font-semibold text-gray-600">نام فارسی</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">نام انگلیسی</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">پروژه</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">بخش</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">سمت</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">شماره ویپ</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredData.map((person, index) => (
                                    <tr key={person.personnelCode} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                    <td className="p-4 text-center font-medium text-gray-800">{person.persianName}</td>
                                    <td className="p-4 text-center text-gray-600">{person.englishName}</td>
                                    <td className="p-4 text-center text-gray-600">{person.project}</td>
                                    <td className="p-4 text-center text-gray-600">{person.department}</td>
                                    <td className="p-4 text-center text-gray-600">{person.position}</td>
                                    <td className="p-4 text-center font-mono font-bold text-gray-800">
                                        <button onClick={(e) => handleVipClick(person.voipNumber, e)} className="hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer">
                                        {toPersianNumbers(person.voipNumber)}
                                        </button>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {filteredData.length === 0 && !isLoading && (
              <div className="text-center py-12 sm:py-20 px-4 sm:px-6">
                <div className="p-4 sm:p-6 bg-white rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow">
                  <UsersIcon className="text-slate-500"/>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-slate-800">نتیجه‌ای یافت نشد</h3>
                <p className="text-gray-600 text-base sm:text-lg">لطفاً عبارت جستجو یا فیلترها را تغییر دهید</p>
              </div>
            )}
        </div>

        <footer className="mt-8 sm:mt-12 flex justify-between items-center px-4 sm:px-6 py-4">
          <Button
            onClick={() => setShowLogin(true)}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-all duration-300"
          >
            <AdminIcon />
            ورود
          </Button>
          <p className="text-xs text-gray-400">{appSettings.designerCredit}</p>
        </footer>
      </div>
    </div>
  )
}
