interface AnnouncementCardProps {
  /**
   * Icon or emoji to display inline with title
   */
  icon: string;
  /**
   * Title of the announcement
   */
  title: string;
  /**
   * Description text for the announcement
   */
  description: string;
}

/**
 * AnnouncementCard component for displaying informational banners
 * Matches Figma design: gradient background (teal-50 to orange-50), border, rounded-xl, hugs content
 */
export function AnnouncementCard({
  icon,
  title,
  description,
}: AnnouncementCardProps) {
  return (
    <div className="bg-gradient-to-br from-teal-50 to-orange-50 border border-border rounded-xl px-6 py-6 flex flex-col gap-2 w-fit">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-lg font-medium text-card-foreground leading-7">
          {title}
        </h3>
      </div>
      <p className="text-base text-muted-foreground leading-6">
        {description}
      </p>
    </div>
  );
}
