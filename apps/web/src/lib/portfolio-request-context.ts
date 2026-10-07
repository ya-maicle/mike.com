import 'server-only'
import { resolveIdentityAccess } from './portfolio-access'
import { accessRequestClient, getAccessRequests } from './portfolio-requests'
import {
  currentAccessRequest,
  requestStatus,
  type PortfolioRequestState,
} from './portfolio-request-model'
import { canReadStudy } from './study-access'

type Study = { _id: string; title: string; slug: string; visibility: string }

export async function portfolioRequestContext(identity: { id: string; email: string }) {
  const [access, requests, content] = await Promise.all([
    resolveIdentityAccess(identity),
    getAccessRequests(identity.id, identity.email),
    accessRequestClient().fetch<{ standard: string[] | null; studies: Study[] }>(
      `{
      "standard": *[_id == "portfolioAccessSettings.config"][0].defaultCaseStudies[]._ref,
      "studies": *[_type == "caseStudy" && visibility in ["recruiter", "members"] && !(_id in path("drafts.**"))]{_id,title,"slug":slug.current,visibility}
    }`,
      {},
      { cache: 'no-store' },
    ),
  ])
  const current = currentAccessRequest(requests)
  const studies =
    access.source === 'blocked'
      ? []
      : content.studies.filter((study) => canReadStudy(study, access))
  const standard = (content.standard ?? []).filter((id) =>
    content.studies.some((study) => study._id === id && study.visibility === 'recruiter'),
  )
  const covered =
    access.hasRecruiterAccess || studies.some((study) => study.visibility === 'recruiter')
  const savedStatus = requestStatus(current)
  const status =
    access.source === 'blocked'
      ? 'blocked'
      : covered
        ? 'approved'
        : savedStatus === 'approved'
          ? 'revoked'
          : savedStatus
  const state: PortfolioRequestState = {
    status,
    email: identity.email,
    ...(current?.expiresAt && savedStatus === 'approved' && !access.companySlug
      ? { expiresAt: current.expiresAt }
      : {}),
    studies: studies.map(({ title, slug }) => ({ title, slug })),
  }
  return { current, standard, state }
}
