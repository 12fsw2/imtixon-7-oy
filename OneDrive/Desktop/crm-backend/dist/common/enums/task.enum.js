"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentStatus = exports.GroupStatus = exports.CourseStatus = exports.AttendanceStatus = exports.PaymentMethod = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PARTIAL"] = "PARTIAL";
    PaymentStatus["OVERDUE"] = "OVERDUE";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["TRANSFER"] = "TRANSFER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "PRESENT";
    AttendanceStatus["ABSENT"] = "ABSENT";
    AttendanceStatus["LATE"] = "LATE";
    AttendanceStatus["EXCUSED"] = "EXCUSED";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["ACTIVE"] = "ACTIVE";
    CourseStatus["INACTIVE"] = "INACTIVE";
    CourseStatus["COMPLETED"] = "COMPLETED";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
var GroupStatus;
(function (GroupStatus) {
    GroupStatus["ACTIVE"] = "ACTIVE";
    GroupStatus["INACTIVE"] = "INACTIVE";
    GroupStatus["COMPLETED"] = "COMPLETED";
})(GroupStatus || (exports.GroupStatus = GroupStatus = {}));
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["ACTIVE"] = "ACTIVE";
    StudentStatus["INACTIVE"] = "INACTIVE";
    StudentStatus["GRADUATED"] = "GRADUATED";
    StudentStatus["EXPELLED"] = "EXPELLED";
})(StudentStatus || (exports.StudentStatus = StudentStatus = {}));
//# sourceMappingURL=task.enum.js.map