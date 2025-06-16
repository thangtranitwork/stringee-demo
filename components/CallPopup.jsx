export default function CallPopup({ caller, onAccept, onReject }) {
  return (
    <div style={{
      position: 'fixed', top: 100, right: 20,
      padding: 20, backgroundColor: '#fff', border: '1px solid #ccc', zIndex: 1000
    }}>
      <p><strong>📞 Cuộc gọi đến từ:</strong> {caller.name}</p>
      <button onClick={onAccept} style={{ marginRight: 10 }}>✅ Accept</button>
      <button onClick={onReject}>❌ Reject</button>
    </div>
  );
}
