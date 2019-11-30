import * as React from 'react';

import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
    return (
        <div className="container">
            <h2>Terms and Conditions</h2>

            <p>Welcome to automoderation.com!</p>

            <p>These terms and conditions outline the rules and regulations for the use of automoderation.com's Website, located at https://automoderation.com.</p>

            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use automoderation.com if you do not agree to take all of the terms and conditions stated on this page.</p>

            <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Netherlands. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.</p>

            <h3>Cookies</h3>

            <p>We employ the use of cookies. By accessing automoderation.com, you agreed to use cookies in agreement with the automoderation.com's Privacy Policy.</p>

            <p>Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>

            <h3>License</h3>

            <p>Unless otherwise stated, automoderation.com and/or its licensors own the intellectual property rights for all material on automoderation.com. All intellectual property rights are reserved. You may access this from automoderation.com for your own personal use subjected to restrictions set in these terms and conditions.</p>

            <p>You must not:</p>
            <ul>
                <li>Sell, rent or sub-license content of automoderation.com</li>
                <li>Reproduce, duplicate or copy content of automoderation.com</li>
                <li>Redistribute content of automoderation.com</li>
            </ul>

            <p>This Agreement shall begin on the date hereof.</p>

            <p>Parts of this website offer an opportunity for users to post and exchange information. Automoderation.com does not filter, edit, publish or review user-generated data prior to its presence on the website.</p>

            <p>automoderation.com reserves the right to monitor all user-generated data and to remove any data which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</p>

            <h3>iFrames</h3>

            <p>Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.</p>

            <h3>Content Liability</h3>

            <p>We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>

            <h3>Your Privacy</h3>

            <p>Please read <Link to="/privacy_policy">Privacy Policy</Link></p>

            <h3>Reservation of Rights</h3>

            <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>

            <h3>Removal of data from our website</h3>

            <p>If you find any data on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider those requests but we are not obligated to or so or to respond to you directly.</p>

            <p>We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.</p>

            <h3>Disclaimer</h3>

            <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>

            <ul>
                <li>limit or exclude our or your liability for death or personal injury;</li>
                <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
            </ul>

            <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>

            <Button size="lg" tag={Link} to="/" color="primary" block className="mb-3">Go to main page</Button>
        </div>
    )
}

export default TermsAndConditions;
