import { Button, IconButton } from "@material-tailwind/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
    count, 
    itemsPerPage, 
    currentPage, 
    onPageChange,
}) {
    const totalPages = Math.ceil(count / itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="!flex !items-center !justify-center gap-2">
            <Button variant="ghost" className="flex text-[#1F2438] shadow-none" onClick={handlePrev} disabled={currentPage === 1}>
                <ChevronLeft className="mr-1.5 h-4 w-4 stroke-2" />
                TRƯỚC
            </Button>

            {Array.from({ length: totalPages }, (_, index) => (
                <IconButton
                    key={index + 1}
                    className={`  iconButton !rouder !p-4 text-md shadow-none border-[1px] text-sky-950 ${currentPage === index + 1 ? 'bg-[#1F2438] text-white' : ''}`}
                    variant={currentPage === index + 1 ? "filled" : "ghost"}
                    onClick={() => onPageChange(index + 1)}
                >
                    {index + 1}
                </IconButton>
            ))}

            <Button variant="ghost" className="flex   text-[#1F2438] shadow-none" onClick={handleNext} disabled={currentPage === totalPages}>
                 KẾ TIẾP 
                <ChevronRight className="ml-1.5 h-4 w-4 stroke-2" />
            </Button>
        </div>
    );
}
