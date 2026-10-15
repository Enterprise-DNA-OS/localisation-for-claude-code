# Evidence and record checks

Checked 15 October 2026. This software checks records, not legal compliance or the truth of translated claims.

- **claim-evidence:** a string marked claim requires a supporting reference and current review date. The [Australian Competition and Consumer Commission](https://www.accc.gov.au/consumers/advertising-and-promotions/false-or-misleading-claims) says business claims must be accurate and have reasonable grounds. A reference in this database does not prove the claim. A competent person assesses both the original and translated meaning.
- **personal-accuracy:** a string marked personal requires an accuracy review before release. [NZ Privacy Principle 8](https://www.privacy.org.nz/privacy-principles/8/) concerns reasonable checks before using or disclosing personal information. This applies only where personal information is present. Do not copy customer personal details into translation examples.
- **retention-purpose:** projects require a documented purpose. [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits keeping personal information beyond the lawful purpose for which it can be used. The software neither chooses a retention period nor deletes records. Review exports, comments, actor names and drafts too.
- **project-review:** a missing or overdue chosen review date blocks readiness. This is an internal policy, not a statutory period.
- **review separation:** the last editor cannot approve the same translation under the same actor label. This is an internal policy, not legal certification. There is no authenticated identity in the CLI.
- **technical checks:** matching placeholders, optional character limits and preferred terms are release controls. Supported tokens are {name} and basic printf forms such as %s, %d and %1$s. Escaped percent syntax, complex ICU and nested placeholders require custom checks. ICU plural/select and markup are blocked. No grammar, semantic accuracy, right-to-left display or legal review is automated.

Evidence dates are the business's choice and expire at the start of the next UTC day after the due date. A source edit invalidates the evidence and prior translation approvals. A target edit clears its review. Changes to glossary rules are evaluated live. None of this sends a notice, certifies a translation or approves a production deployment.
