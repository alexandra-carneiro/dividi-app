'use client'
import { X, Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'

interface ImportModalProps {
  isImportOpen: boolean
  setIsImportOpen: (open: boolean) => void
  pendingImports: any[]
  detectedHeaders: string[]
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  cancelImport: () => void
  confirmImport: () => void
  formatMoney: (v: number) => string
}

export default function ImportModal({
  isImportOpen,
  setIsImportOpen,
  pendingImports,
  detectedHeaders,
  handleFileUpload,
  cancelImport,
  confirmImport,
  formatMoney
}: ImportModalProps) {
  if (!isImportOpen) return null

  const validCount = pendingImports.filter(e => e.date && !isNaN(e.amount) && e.payer).length

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4" onClick={() => setIsImportOpen(false)}>
      <div 
        className="glass-morphism p-8 md:p-10 rounded-[3rem] shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-10 text-center">
          <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/5 transform rotate-3">
            <Upload size={40} />
          </div>
          <h3 className="font-black text-3xl text-white tracking-tighter">Importar Planilha</h3>
          <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest opacity-80">Sincronização de Dados em Massa</p>
          <button 
            type="button" 
            onClick={() => setIsImportOpen(false)} 
            className="absolute -top-4 -right-4 p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-full text-slate-400 transition-all group"
          >
             <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {pendingImports.length === 0 ? (
          <div className="border-2 border-dashed border-white/10 p-12 md:p-20 text-center rounded-[3rem] bg-white/5 group hover:bg-white/[0.07] hover:border-indigo-500/50 transition-all duration-500">
            <div className="bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5">
              <FileText size={48} className="text-slate-400 group-hover:text-indigo-400" />
            </div>
            <p className="text-xl font-black text-slate-300 mb-2">Arraste seu arquivo aqui</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10 opacity-80">Suporta .xlsx, .xls ou .csv</p>
            <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer inline-block">
              Selecionar Arquivo
              <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="hidden"/>
            </label>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl mb-8 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-amber-400 font-black text-[10px] uppercase tracking-widest mb-1">Verificação de Consistência</p>
                <p className="text-slate-400 font-medium text-xs">Confirme se as colunas foram detectadas corretamente. Linhas marcadas em vermelho serão ignoradas.</p>
              </div>
            </div>

            {detectedHeaders.length > 0 && (
              <div className="mb-8 p-4 bg-black/40 rounded-2xl text-[9px] text-indigo-400 font-mono border border-white/5 shadow-inner overflow-x-auto whitespace-nowrap scrollbar-hide">
                <strong className="text-slate-400 uppercase tracking-widest mr-4">Headers:</strong> {detectedHeaders.join(' | ')}
              </div>
            )}

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto mb-10 border border-white/5 rounded-[2rem] shadow-inner custom-scrollbar bg-white/5">
              <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                <thead className="bg-slate-900/50 sticky top-0 z-10 border-b border-white/5 backdrop-blur-md">
                  <tr>
                    <th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[9px]">Data</th>
                    <th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[9px]">Descrição</th>
                    <th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[9px]">Pagador</th>
                    <th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingImports.map((exp) => {
                    const isValid = exp.date && !isNaN(exp.amount) && exp.payer;
                    return (
                      <tr key={exp._id} className={`${isValid ? "hover:bg-white/5 text-slate-300" : "bg-rose-500/10 text-rose-400"} transition-colors`}>
                        <td className="p-6 font-bold">{exp.date || '---'}</td>
                        <td className="p-6 font-black truncate max-w-[300px]">{exp.description}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isValid ? 'bg-white/5 border border-white/10' : 'bg-rose-500/20 border border-rose-500/20'}`}>
                            {exp.payer || '???'}
                          </span>
                        </td>
                        <td className="p-6 font-black text-right text-lg">{!isNaN(exp.amount) ? formatMoney(exp.amount) : 'Erro'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={cancelImport} 
                className="flex-1 p-5 bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
              >
                Descartar
              </button>
              <button 
                onClick={confirmImport} 
                disabled={validCount === 0}
                className="flex-[2] p-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <CheckCircle2 size={18} />
                Confirmar Importação ({validCount} Itens)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
