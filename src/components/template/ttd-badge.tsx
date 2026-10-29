/** Marks a template that prints the holder's taxpayer number (ТТД). */
export function TtdBadge() {
  return (
    <span
      title="Худалдан авагчийн татвар төлөгчийн дугаар гэрээнд хэвлэгдэнэ"
      className="inline-flex items-center rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary"
    >
      ТТД
    </span>
  );
}
