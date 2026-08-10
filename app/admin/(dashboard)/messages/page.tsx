import MessagesList from "@/components/admin/MessagesList";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-ink">Messages</h1>
      <MessagesList
        initialMessages={messages.map((m) => ({
          ...m,
          eventDate: m.eventDate ? m.eventDate.toISOString() : null,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
