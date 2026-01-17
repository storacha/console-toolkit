import { storachaLogoUrl } from '../../../../packages/react-styled/src/assets/index'

export function Header() {
    return (
        <header className="app-header authenticated-header">
            <div className="logo-container-3d">
                <div className="logo-wrapper-3d web3mail-logo-3d">
                    <div className="logo-glow"></div>
                    <img src="/web3mail-logo.jpeg" alt="Web3Mail" className="logo-img-3d" />
                </div>
                <div className="divider-3d">×</div>
                <div className="logo-wrapper-3d storacha-logo-3d">
                    <div className="logo-glow"></div>
                    <img src={storachaLogoUrl} alt="Storacha" className="logo-img-3d" />
                </div>
            </div>

            <h1 className="title-3d">
                <span className="title-gradient">Storacha</span>
                <span className="title-separator"> × </span>
                <span className="title-gradient-alt">Web3Mail</span>
            </h1>

            <p className="subtitle-3d">Decentralized storage meets decentralized messaging</p>
        </header>
    )
}