import { ActivityLogItem } from '../types';

interface LogsViewProps {
  activityLogs: ActivityLogItem[];
  triggerDatabaseExportType: (type: 'JSON' | 'CSV' | 'ZIP') => void;
}

export default function LogsView({
  activityLogs,
  triggerDatabaseExportType
}: LogsViewProps) {
  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">System Audit &amp; Activity Log</h2>
          <p className="text-xs text-[#666666] font-semibold">Immutable trace ledger records login, cloud uploads, QR scans, and system synchronized status.</p>
        </div>

        {/* Export log formats */}
        <div className="flex gap-2">
          <button 
            onClick={() => triggerDatabaseExportType('CSV')}
            className="bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] font-bold text-xs px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-[#222222] cursor-pointer"
          >
            Export CSV Audit
          </button>
          <button 
            onClick={() => triggerDatabaseExportType('JSON')}
            className="bg-[#222222] hover:bg-[#333333] text-white font-bold text-xs px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Export JSON Profile
          </button>
        </div>
      </div>

      {/* Searchable log table */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-xs font-bold text-[#666666]">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Device / Client</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Audited Information</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E5E5E5]">
              {activityLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors font-mono">
                  <td className="p-4 text-[#666666]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      log.action === 'Login' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'Upload' ? 'bg-green-100 text-green-700' :
                      log.action === 'QR Scan' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-[#222222] truncate max-w-[150px]" title={log.device}>{log.device}</td>
                  <td className="p-4 text-[#666666]">{log.ipAddress}</td>
                  <td className="p-4">
                    <span className={`font-bold ${
                      log.status === 'Success' ? 'text-[#22C55E]' :
                      log.status === 'Warning' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                    }`}>
                      ● {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-[#222222] font-semibold">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
