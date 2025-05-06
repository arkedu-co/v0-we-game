export default function ConfirmacaoRecuperarSenhaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Instruções Enviadas</h1>

        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Instruções enviadas</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Se o email fornecido estiver cadastrado em nosso sistema, você receberá instruções para redefinir sua
                  senha.
                </p>
                <p className="mt-2">Por favor, verifique sua caixa de entrada e também a pasta de spam.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/professor/login"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  )
}
