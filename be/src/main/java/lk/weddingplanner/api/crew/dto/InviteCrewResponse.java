package lk.weddingplanner.api.crew.dto;

import lk.weddingplanner.api.wedding.dto.WeddingMemberResponse;

public record InviteCrewResponse(WeddingMemberResponse member, boolean createdNewUser, String tempPassword) {}
