import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

const ProfilePage = () => {
    const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // เช็คประเภทไฟล์ต้องเป็น PNG หรือ JPG/JPEG เท่านั้น
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            Swal.fire({
                icon: "error",
                title: "ไฟล์ไม่รองรับ",
                text: "กรุณาอัปโหลดรูปภาพที่เป็นไฟล์ .png, .jpg หรือ .jpeg เท่านั้น",
                background: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#1d232a" : "#fff",
                color: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#a6adbb" : "#000"
            });
            e.target.value = ""; // รีเซ็ตค่า input กลับ
            return;
        }

        // ถามยืนยันก่อนอัปเดต
        const result = await Swal.fire({
            title: "ยืนยันการเปลี่ยนรูปโปรไฟล์?",
            text: "คุณต้องการใช้รูปนี้เป็นรูปโปรไฟล์ใหม่หรือไม่",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, ฉันต้องการเปลี่ยน",
            cancelButtonText: "ยกเลิก",
            background: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#1d232a" : "#fff",
            color: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#a6adbb" : "#000"
        });

        if (result.isConfirmed) {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64Image = reader.result;
                setSelectedImg(base64Image);
                await updateProfile({ profilePic: base64Image });
                
                // แสดง Popup แจ้งเตือนความสำเร็จและตั้งเวลาให้หายไปเอง 2 วินาที (2000 ms)
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "แก้ไขรูปโปรไฟล์สำเร็จ",
                    showConfirmButton: false,
                    timer: 2000,
                    background: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#1d232a" : "#fff",
                    color: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#a6adbb" : "#000"
                });
            };
        } else {
            // ถ้ายกเลิก ก็รีเซ็ตค่า input file
            e.target.value = "";
        }
    };

    const handleEditName = async () => {
        const { value: newName } = await Swal.fire({
            title: "แก้ไขชื่อโปรไฟล์",
            input: "text",
            inputLabel: "ชื่อ - สกุลใหม่ของคุณ",
            inputValue: authUser?.fullName || "",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "บันทึก",
            cancelButtonText: "ยกเลิก",
            background: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#1d232a" : "#fff",
            color: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#a6adbb" : "#000",
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "คุณยังไม่ได้ใส่ชื่อ!";
                }
            }
        });

        if (newName && newName.trim() !== authUser.fullName) {
            // เรียก function updateProfile เพื่อส่งข้อมูลใหม่ไปแก้ไข
            await updateProfile({ fullName: newName.trim() });
            
            Swal.fire({
                position: "center",
                icon: "success",
                title: "แก้ไขชื่อโปรไฟล์สำเร็จ",
                showConfirmButton: false,
                timer: 2000,
                background: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#1d232a" : "#fff",
                color: document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark") ? "#a6adbb" : "#000"
            });
        }
    };

    return (
        <div className="h-dvh pt-20">
            <div className="max-w-2xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold ">Profile</h1>
                        <p className="mt-2 text-sm text-base-content/60">Your profile information</p>
                    </div>

                    {/* avatar upload section */}

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={selectedImg || authUser.profilePic || "/avatar.png"}
                                alt="Profile"
                                className="size-32 rounded-full object-cover border-4 "
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
                            >
                                <Camera className="w-5 h-5 text-base-200" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleImageUpload}
                                    disabled={isUpdatingProfile}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-zinc-400">
                            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
                                <button 
                                    onClick={handleEditName}
                                    disabled={isUpdatingProfile}
                                    className="p-3 bg-base-200 border rounded-lg hover:bg-base-content/10 transition-colors"
                                    title="Edit Name"
                                >
                                    <Edit2 className="w-5 h-5 text-base-content" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </div>
                            <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-base-content/60">{authUser?.email} <span className="text-xs ml-2">(ไม่สามารถแก้ไขได้)</span></p>
                        </div>
                    </div>

                    <div className="mt-6 bg-base-300 rounded-xl p-6">
                        <h2 className="text-lg font-medium  mb-4">Account Information</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                                <span>Member Since</span>
                                <span>{authUser.createdAt?.split("T")[0]}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span>Account Status</span>
                                <span className="text-green-500">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
