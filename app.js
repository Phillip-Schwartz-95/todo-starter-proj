import { RootCmp } from './RootCmp.jsx'
import { store } from './store/store.js'
const { HashRouter } = ReactRouterDOM

const { Provider } = ReactRedux

const elContainer = document.getElementById('root')
const root = ReactDOM.createRoot(elContainer)
root.render(
    <HashRouter>
        <Provider store={store}>
            <RootCmp />
        </Provider>
    </HashRouter>
)
