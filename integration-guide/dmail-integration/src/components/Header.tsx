export function Header() {
    return (
        <header className="app-header authenticated-header">
            <div className="logo-container-3d">
                <div className="logo-wrapper-3d Dmail-logo-3d">
                    <div className="logo-glow"></div>
                    <img src="/dmail-logo.png" alt="DMail" className="logo-img-3d" />
                </div>
                <div className="divider-3d">×</div>
                <div className="logo-wrapper-3d storacha-logo-3d">
                    <div className="logo-glow"></div>
                    <img src="/storacha-logo.svg" alt="Storacha" className="logo-img-3d" />
                </div>
            </div>

            <h1 className="title-3d">
                <span className="title-gradient-alt">DMail</span>
                <span className="title-separator"> × </span>
                <span className="title-gradient">Storacha</span>
            </h1>
        </header>
    )
}