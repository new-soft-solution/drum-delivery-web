import IconifyIcon from "@/components/wrappers/IconifyIcon";

export default function NoDataFound({icon, title, message,}: { icon?: string, title?: string, message?: string }) {
    return (
        <div
            className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="bg-light rounded-circle p-4 mb-3">
                <IconifyIcon
                    icon={icon || "lucide:database-zap"}
                    className="text-muted"
                    width={48}
                    height={48}
                />
            </div>
            <h5 className="text-muted mb-2">{title || "No Data Available"}</h5>
            <p className="text-muted mb-3">
                {message || "We couldn&apos;t find any records matching your criteria"}
            </p>
        </div>
    )
}