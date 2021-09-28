import * as React from 'react';

import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom';
import { ShellHost } from './shellHost';
import { BaseComponent, IShellPage } from './shellInterfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ShellNav from './shellNav';

import './shell.css';

export type ShellProps = {
	pages: IShellPage[];
};
export type ShellState = {
	currentPage: IShellPage
};

export class Shell extends BaseComponent<ShellProps, ShellState> {

	constructor(props: ShellProps) {
		super(props);
	}

	render() {
		const pages = this.readProps().pages;
		return <Router>
			<div className="main-wrapper">
				<ShellNav pages={pages} />
				<div className="content-wrapper">
					<div className="listing-banner d-flex align-items-center shadow">
<<<<<<< Updated upstream
			    	<FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
			        	<h1>The RaptorSwap <strong>BETA</strong> is <strong>finally here</strong>! We are looking for projects to list on our exchange. Reach out to us on <a href="https://t.me/RaptorSwap">Telegram</a><br/>
					    Please migrate your Raptor V2 tokens to Raptor V3 as soon as possible.<br/></h1>
			</div>
=======
						<FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
						<h1>The RaptorSwap <strong>BETA</strong> is <strong>finally here</strong>! We are looking for projects to list on our exchange. Reach out to us on <a href="https://t.me/RaptorSwap">Telegram</a>.<br/>
						<b>IMPORTANT NOTE:</b> We've applied 100% Fee on every Buy/Sell order on Raptor V2. Please <b><u><a href="../migrate">migrate</a></u></b> to Raptor V3 as soon as possible to continue the Buy/Sell orders</h1>

					</div>
>>>>>>> Stashed changes
					<Switch>
						{pages.map(page => (
							<Route key={`${page.id}`} path={'/' + page.id}>
								<ShellHost page={page} />
							</Route>
						))}
						<Route
							exact
							path="/"
							render={() => {
								return (
									<Redirect to="/home" />
								)
							}}
						/>
					</Switch>
				</div>
			</div>
		</Router>
	}
}
